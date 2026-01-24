import { NextRequest, NextResponse } from "next/server";
import { otpVerificationSchema } from "@/schemas/auth";
import { verifyOTP, deleteOTP, getUserByEmail } from "@/lib/aws/dynamodb";
import { 
  signUpWithEmail, 
  signInWithEmail,
  userExistsInCognito,
  createCognitoUserWithPassword,
  confirmCognitoUser,
  deleteCognitoUser,
} from "@/lib/aws/cognito-server";
import { getUserFromIdToken } from "@/lib/aws/cognito";
import { createUser, getUser } from "@/lib/aws/dynamodb";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, password, name, purpose = "signup" } = body;

    const validated = otpVerificationSchema.parse({ email, otp });

    // Verify OTP
    const otpResult = await verifyOTP(validated.email, validated.otp);

    if (!otpResult.valid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Delete OTP after successful verification
    await deleteOTP(validated.email);

    if (purpose === "signup") {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for signup" },
          { status: 400 }
        );
      }

      // Check if user already exists in DynamoDB
      const existingUser = await getUserByEmail(validated.email);
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists. Please login instead." },
          { status: 400 }
        );
      }

      // Check if user exists in Cognito
      const existsInCognito = await userExistsInCognito(validated.email);
      
      let cognitoUserId: string;
      let idToken: string;

      if (existsInCognito) {
        // User exists in Cognito but not in DynamoDB (Orphaned state)
        // Since OTP is verified (email ownership proved), we can safely clean up the orphaned record
        // and create a fresh one to ensure data consistency and correct password.
        try {
          await deleteCognitoUser(validated.email);
        } catch (cleanupError) {
          console.error("Failed to cleanup orphaned Cognito user:", cleanupError);
          // If delete fails, we might still be able to proceed if we can sign in
          // But usually better to fail here than create inconsistent state
        }
        
        // Proceed to create fresh user (same logic as else block below)
        const cognitoResult = await createCognitoUserWithPassword(
          validated.email,
          password,
          name
        );
        
        cognitoUserId = cognitoResult.userId;
        
        // Sign in the newly created user
        const signInResult = await signInWithEmail(validated.email, password);
        idToken = signInResult.idToken;
      } else {
        // New user - create in Cognito with auto-confirmation (email already verified via OTP)
        const cognitoResult = await createCognitoUserWithPassword(
          validated.email,
          password,
          name
        );
        
        cognitoUserId = cognitoResult.userId;
        
        // Sign in the newly created user
        const signInResult = await signInWithEmail(validated.email, password);
        idToken = signInResult.idToken;
      }

      // Get user info from ID token
      let user = getUserFromIdToken(idToken);
      
      // Update with provided name if available
      if (name) {
        user.name = name;
      }
      user.provider = "email";

      // Create user in DynamoDB
      await createUser(user);

      // Create session
      await createSession(user, idToken);

      return NextResponse.json({ 
        success: true, 
        user,
        message: "Account created successfully!"
      });
    } else if (purpose === "login") {
      // Check if user exists in DynamoDB first
      const existingUser = await getUserByEmail(validated.email);
      
      // Check if user exists in Cognito
      const existsInCognito = await userExistsInCognito(validated.email);

      // If user registered via Google, OTP verification confirms email ownership
      // They still need to sign in via Google (no password available)
      if (existingUser && existingUser.provider === "google") {
        // OTP verified successfully - email ownership confirmed
        // Confirm the user in Cognito if they exist there
        if (existsInCognito) {
          await confirmCognitoUser(validated.email);
        }
        
        return NextResponse.json({ 
          success: true, 
          user: existingUser,
          verified: true,
          requiresGoogleSignIn: true,
          message: "Email verified successfully. Please sign in via Google to continue."
        });
      }

      // If user doesn't exist in DynamoDB but exists in Cognito, create DynamoDB record
      if (!existingUser && existsInCognito) {
        // User exists in Cognito but not in DynamoDB - this shouldn't happen normally
        // but we'll handle it by requiring password to sign in
        if (!password) {
          return NextResponse.json(
            { error: "Password is required for login" },
            { status: 400 }
          );
        }

        try {
          const signInResult = await signInWithEmail(validated.email, password);
          let user = getUserFromIdToken(signInResult.idToken);
          user.provider = "email";
          
          // Create user in DynamoDB
          await createUser(user);
          
          // Confirm user in Cognito (mark email as verified)
          await confirmCognitoUser(validated.email);
          
          await createSession(user, signInResult.idToken);
          return NextResponse.json({ success: true, user });
        } catch (authError: any) {
          if (authError.message?.includes("Invalid email or password") || authError.message?.includes("NotAuthorized")) {
            return NextResponse.json(
              { error: "Invalid email or password. Please check your credentials." },
              { status: 401 }
            );
          }
          throw authError;
        }
      }

      // If user doesn't exist at all, redirect to signup
      if (!existingUser && !existsInCognito) {
        return NextResponse.json(
          { error: "No account found with this email. Please sign up first." },
          { status: 404 }
        );
      }

      // For email-registered users, password is required
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for login" },
          { status: 400 }
        );
      }

      // Sign in user with Cognito
      try {
        // Confirm user in Cognito (mark email as verified via OTP)
        if (existsInCognito) {
          await confirmCognitoUser(validated.email);
        }

        const cognitoResult = await signInWithEmail(
          validated.email,
          password
        );

        let user = getUserFromIdToken(cognitoResult.idToken);
        let dbUser = await getUser(user.id);
        
        if (!dbUser) {
          // User exists in Cognito but not in DynamoDB - create record
          user.provider = existingUser?.provider || "email";
          await createUser(user);
          dbUser = user;
        } else {
          // Update user info from token
          dbUser = user;
        }

        await createSession(dbUser, cognitoResult.idToken);

        return NextResponse.json({ success: true, user: dbUser });
      } catch (authError: any) {
        if (authError.message?.includes("Invalid email or password") || authError.message?.includes("NotAuthorized")) {
          return NextResponse.json(
            { error: "Invalid email or password. Please check your credentials." },
            { status: 401 }
          );
        }
        if (authError.message?.includes("User not confirmed") || authError.message?.includes("UserNotConfirmedException")) {
          // User exists but not confirmed - try to confirm and retry
          try {
            await confirmCognitoUser(validated.email);
            const retryResult = await signInWithEmail(validated.email, password);
            let user = getUserFromIdToken(retryResult.idToken);
            let dbUser = await getUser(user.id);
            if (!dbUser) {
              user.provider = existingUser?.provider || "email";
              await createUser(user);
              dbUser = user;
            } else {
              dbUser = user;
            }
            await createSession(dbUser, retryResult.idToken);
            return NextResponse.json({ success: true, user: dbUser });
          } catch (retryError: any) {
            return NextResponse.json(
              { error: "Invalid email or password. Please check your credentials." },
              { status: 401 }
            );
          }
        }
        throw authError;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid purpose" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("OTP verification error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message?.includes("DynamoDB") || error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Database not configured. Please create DynamoDB tables in AWS Console." },
        { status: 500 }
      );
    }

    if (error.message?.includes("Invalid email or password") || error.message?.includes("NotAuthorized") || error.message?.includes("User not found")) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    if (error.message?.includes("Email already in use") || error.message?.includes("UsernameExists")) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Return the actual error message if available
    return NextResponse.json(
      { error: error.message || "Verification failed. Please check the console for details." },
      { status: 500 }
    );
  }
}

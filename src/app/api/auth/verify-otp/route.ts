import { NextRequest, NextResponse } from "next/server";
import { otpVerificationSchema } from "@/schemas/auth";
import { verifyOTP, deleteOTP, getUserByEmail } from "@/lib/aws/dynamodb";
import { signUpWithEmail, signInWithEmail } from "@/lib/aws/cognito-server";
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

      // Try to create user with email/password in Cognito
      let cognitoResult;
      try {
        cognitoResult = await signUpWithEmail(
          validated.email,
          password,
          name
        );
      } catch (authError: any) {
        // If email already exists in Cognito, try to sign in instead
        if (authError.message?.includes("Email already in use") || authError.message?.includes("UsernameExists")) {
          try {
            const signInResult = await signInWithEmail(validated.email, password);
            // User exists in Cognito, create DynamoDB record if missing
            let user = getUserFromIdToken(signInResult.idToken);
            let dbUser = await getUser(user.id);
            if (!dbUser) {
              if (name) {
                user.name = name;
              }
              await createUser(user);
              dbUser = user;
            } else {
              dbUser = user;
            }
            await createSession(dbUser, signInResult.idToken);
            return NextResponse.json({ success: true, user: dbUser });
          } catch (signInError: any) {
            // Password might be wrong, or other error
            if (signInError.message?.includes("Invalid email or password") || signInError.message?.includes("NotAuthorized")) {
              return NextResponse.json(
                { error: "Email already registered. Please login with your password." },
                { status: 400 }
              );
            }
            throw signInError;
          }
        }
        throw authError;
      }

      // New user created successfully in Cognito
      const user: any = {
        id: cognitoResult.userId,
        email: cognitoResult.email,
        name: name,
        provider: "email",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createUser(user);

      // For Cognito signup, user needs to confirm email first before getting tokens
      // For now, we'll need to sign them in after confirmation
      // This is a simplified flow - in production you might want to auto-confirm
      return NextResponse.json({ 
        success: true, 
        user,
        requiresConfirmation: cognitoResult.requiresConfirmation,
        message: cognitoResult.requiresConfirmation 
          ? "Please check your email to confirm your account, then login."
          : "Account created successfully. Please login."
      });
    } else if (purpose === "login") {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required for login" },
          { status: 400 }
        );
      }

      // Check if user exists first
      const existingUser = await getUserByEmail(validated.email);
      if (!existingUser) {
        return NextResponse.json(
          { error: "No account found with this email. Please sign up first." },
          { status: 404 }
        );
      }

      // Sign in user with Cognito
      try {
        const cognitoResult = await signInWithEmail(
          validated.email,
          password
        );

        let user = getUserFromIdToken(cognitoResult.idToken);
        let dbUser = await getUser(user.id);
        if (!dbUser) {
          await createUser(user);
          dbUser = user;
        } else {
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

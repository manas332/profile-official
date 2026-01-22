import { NextRequest, NextResponse } from "next/server";
import { signUpWithEmail, signInWithEmail } from "@/lib/aws/cognito-server";
import { getUserFromIdToken } from "@/lib/aws/cognito";
import { createUser, getUser, getUserByEmail } from "@/lib/aws/dynamodb";
import { createSession } from "@/lib/auth/session";
import { signUpSchema, loginSchema } from "@/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "signup") {
      const validated = signUpSchema.parse(data);
      
      // Check if user already exists
      const existingUser = await getUserByEmail(validated.email);
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      const cognitoResult = await signUpWithEmail(
        validated.email,
        validated.password,
        validated.name
      );

      // Create user in DynamoDB
      const user: any = {
        id: cognitoResult.userId,
        email: cognitoResult.email,
        name: validated.name,
        provider: "email",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createUser(user);

      // For Cognito, we need to confirm the user first or use admin to set password
      // For now, return success - user will need to confirm email if required
      // In production, you might want to auto-confirm or use admin APIs
      return NextResponse.json({ 
        success: true, 
        user,
        requiresConfirmation: cognitoResult.requiresConfirmation 
      });
    } else if (action === "login") {
      const validated = loginSchema.parse(data);
      
      // Try to sign in with Cognito
      try {
        const cognitoResult = await signInWithEmail(
          validated.email,
          validated.password
        );

        // Get user info from ID token
        let user = getUserFromIdToken(cognitoResult.idToken);
        
        // Check/create DynamoDB record
        let dbUser = await getUser(user.id);
        if (!dbUser) {
          // User exists in Cognito but not in DynamoDB - create DynamoDB record
          await createUser(user);
          dbUser = user;
        } else {
          dbUser = user; // Use user from token for consistency
        }

        await createSession(dbUser, cognitoResult.idToken);

        return NextResponse.json({ success: true, user: dbUser });
      } catch (authError: any) {
        // Handle Cognito errors
        if (authError.message?.includes("not found") || authError.message?.includes("User not found")) {
          return NextResponse.json(
            { error: "No account found with this email. Please sign up instead." },
            { status: 404 }
          );
        }
        if (authError.message?.includes("Invalid email or password") || authError.message?.includes("NotAuthorized")) {
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          );
        }
        throw authError;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Email auth error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (error.message?.includes("Invalid email or password") || error.message?.includes("NotAuthorized")) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (error.message?.includes("Email already in use") || error.message?.includes("UsernameExists")) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

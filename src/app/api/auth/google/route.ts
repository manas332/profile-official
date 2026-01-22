import { NextRequest, NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/aws/dynamodb";
import { getUserFromIdToken } from "@/lib/aws/cognito";
import { createSession as createAppSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify and decode Cognito ID token
    // Cognito ID tokens are JWT tokens that can be decoded and verified
    let user;
    try {
      user = getUserFromIdToken(idToken);
    } catch (error: any) {
      console.error("Error decoding Cognito ID token:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    // Check if user exists in DynamoDB, create if not
    let dbUser = await getUser(user.id);
    
    if (!dbUser) {
      await createUser(user);
      dbUser = user;
    } else {
      // Update user info from token (in case profile changed)
      dbUser = user;
    }

    // Create session
    await createAppSession(dbUser, idToken);

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

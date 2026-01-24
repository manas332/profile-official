import { NextRequest, NextResponse } from "next/server";
import { getUserFromIdToken } from "@/lib/aws/cognito";
import { createUser, getUser } from "@/lib/aws/dynamodb";
import { createSession, getSession } from "@/lib/auth/session";

// GET: Check existing session
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: session.user,
      });
    }
    
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}

// POST: Create/update session from Amplify token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Get user info from ID token
    let user = getUserFromIdToken(idToken);
    
    // Check/create DynamoDB record
    let dbUser = await getUser(user.id);
    
    // Also check by email in case user exists with different ID
    if (!dbUser && user.email) {
      const { getUserByEmail, updateUser } = await import("@/lib/aws/dynamodb");
      const existingUserByEmail = await getUserByEmail(user.email);
      if (existingUserByEmail) {
        dbUser = existingUserByEmail;
        // Update profile info (can't change primary key id)
        await updateUser(existingUserByEmail.id, {
          photoURL: user.photoURL || existingUserByEmail.photoURL,
          name: user.name || existingUserByEmail.name,
        });
        dbUser = { ...existingUserByEmail, photoURL: user.photoURL || existingUserByEmail.photoURL, name: user.name || existingUserByEmail.name };
      }
    }
    
    if (!dbUser) {
      await createUser(user);
      dbUser = user;
    } else {
      // Update user info from token (in case profile changed)
      const { updateUser } = await import("@/lib/aws/dynamodb");
      await updateUser(dbUser.id, {
        photoURL: user.photoURL || dbUser.photoURL,
        name: user.name || dbUser.name,
      });
      dbUser = { ...dbUser, photoURL: user.photoURL || dbUser.photoURL, name: user.name || dbUser.name };
    }

    // Create session
    await createSession(dbUser, idToken);

    return NextResponse.json({
      authenticated: true,
      user: dbUser,
    });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}

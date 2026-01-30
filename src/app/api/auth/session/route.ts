import { NextRequest, NextResponse } from "next/server";
import { getUserFromIdToken } from "@/lib/aws/cognito";
import { createSession } from "@/lib/auth/session";
import { createUser, getUser, getUserByEmail, updateUser } from "@/lib/aws/dynamodb";

// POST: Sync user to DynamoDB after Amplify authentication
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
    let tokenUser;
    try {
      tokenUser = getUserFromIdToken(idToken);
    } catch (error: any) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user exists in DynamoDB by ID first
    let dbUser = await getUser(tokenUser.id);

    // Also check by email to handle account linking
    // (user signed up with email, then signs in with Google using same email)
    if (!dbUser && tokenUser.email) {
      const existingUserByEmail = await getUserByEmail(tokenUser.email);
      if (existingUserByEmail) {
        dbUser = existingUserByEmail;
        // Update profile info from the new token
        const updateData = {
          photoURL: tokenUser.photoURL || existingUserByEmail.photoURL,
          name: tokenUser.name || existingUserByEmail.name,
        };
        await updateUser(existingUserByEmail.id, updateData);
        dbUser = { ...existingUserByEmail, ...updateData };
      }
    }

    if (!dbUser) {
      // New user - create in DynamoDB
      await createUser(tokenUser);
      dbUser = tokenUser;
    } else {
      // Existing user - update profile info from token
      const updateData = {
        photoURL: tokenUser.photoURL || dbUser.photoURL,
        name: tokenUser.name || dbUser.name,
      };
      await updateUser(dbUser.id, updateData);
      dbUser = { ...dbUser, ...updateData };
    }

    // Create session cookie
    await createSession(dbUser, idToken);

    return NextResponse.json({
      success: true,
      user: dbUser,
    });
  } catch (error: any) {
    console.error("Session sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}

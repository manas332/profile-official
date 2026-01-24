import { NextRequest, NextResponse } from "next/server";
import { createUser, getUser, getUserByEmail, updateUser } from "@/lib/aws/dynamodb";
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
    
    // Check if user exists in DynamoDB by ID first
    let dbUser = await getUser(user.id);
    
    // Also check by email to handle case where user registered via email but signs in via Google
    // (Cognito might create different user IDs for email vs Google, or link them)
    if (!dbUser && user.email) {
      const existingUserByEmail = await getUserByEmail(user.email);
      if (existingUserByEmail) {
        // User exists with same email but potentially different Cognito ID
        // If Cognito IDs match, use existing user
        if (existingUserByEmail.id === user.id) {
          dbUser = existingUserByEmail;
        } else {
          // Different Cognito IDs - this means Cognito created separate users
          // Use the existing user record (from email registration) and update it
          // Note: We can't change the primary key (id) in DynamoDB, so we keep the original ID
          // but update other fields and allow Google sign-in
          dbUser = existingUserByEmail;
          
          // Update user info but keep original ID and provider
          // This allows the user to sign in via Google while maintaining their original registration
          await updateUser(existingUserByEmail.id, {
            photoURL: user.photoURL || existingUserByEmail.photoURL,
            name: user.name || existingUserByEmail.name,
            // Keep original provider to maintain registration method tracking
          });
          
          // Use existing user data but with updated info from Google token
          dbUser = { 
            ...existingUserByEmail, 
            photoURL: user.photoURL || existingUserByEmail.photoURL,
            name: user.name || existingUserByEmail.name,
          };
        }
      }
    }
    
    if (!dbUser) {
      // New user - create in DynamoDB
      await createUser(user);
      dbUser = user;
    } else {
      // Update user info from token (in case profile changed)
      await updateUser(dbUser.id, {
        photoURL: user.photoURL || dbUser.photoURL,
        name: user.name || dbUser.name,
      });
      dbUser = { ...dbUser, photoURL: user.photoURL || dbUser.photoURL, name: user.name || dbUser.name };
    }

    // Create session
    await createAppSession(dbUser, idToken);

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error("Google auth error:", error);
    
    // Handle case where user already exists with different ID
    if (error.message?.includes("already exists") || error.message?.includes("ConditionalCheckFailedException")) {
      // Try to get user by email instead
      try {
        const user = getUserFromIdToken(idToken);
        if (user.email) {
          const existingUser = await getUserByEmail(user.email);
          if (existingUser) {
            // User exists - update profile info and create session
            await updateUser(existingUser.id, {
              photoURL: user.photoURL || existingUser.photoURL,
              name: user.name || existingUser.name,
            });
            const updatedUser = { ...existingUser, photoURL: user.photoURL || existingUser.photoURL, name: user.name || existingUser.name };
            await createAppSession(updatedUser, idToken);
            return NextResponse.json({ success: true, user: updatedUser });
          }
        }
      } catch (retryError) {
        // Fall through to return error
      }
    }
    
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

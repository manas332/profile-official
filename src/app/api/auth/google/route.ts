import { NextRequest, NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/firebase/firestore";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // Verify Firebase ID token using Firebase REST API
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      return NextResponse.json(
        { error: "Firebase API key not configured" },
        { status: 500 }
      );
    }
    
    // Verify the token by getting user info from Firebase
    const verifyResponse = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json().catch(() => ({}));
      console.error("Token verification failed:", errorData);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const tokenData = await verifyResponse.json();
    
    if (!tokenData.users || tokenData.users.length === 0) {
      return NextResponse.json(
        { error: "User not found in token" },
        { status: 401 }
      );
    }

    const firebaseUser = tokenData.users[0];
    
    // Check if user exists, create if not
    let user = await getUser(firebaseUser.localId);
    
    if (!user) {
      user = {
        id: firebaseUser.localId,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoUrl || undefined,
        provider: "google",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await createUser(user);
    }

    // Create session
    await createSession(user, idToken);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

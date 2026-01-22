import { NextRequest, NextResponse } from "next/server";
import { signUpWithEmail, signInWithEmail, convertFirebaseUserToUser } from "@/lib/firebase/auth";
import { createUser, getUser, getUserByEmail } from "@/lib/firebase/firestore";
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

      const firebaseUser = await signUpWithEmail(
        validated.email,
        validated.password,
        validated.name
      );

      const user = convertFirebaseUserToUser(firebaseUser);
      await createUser(user);

      // Get ID token for session
      const token = await firebaseUser.getIdToken();
      await createSession(user, token);

      return NextResponse.json({ success: true, user });
    } else if (action === "login") {
      const validated = loginSchema.parse(data);
      
      // Try to sign in with Firebase Auth first (this is the source of truth)
      try {
        const firebaseUser = await signInWithEmail(
          validated.email,
          validated.password
        );

        // User authenticated successfully, check/create Firestore record
        let user = await getUser(firebaseUser.uid);
        if (!user) {
          // User exists in Auth but not in Firestore - create Firestore record
          user = convertFirebaseUserToUser(firebaseUser);
          await createUser(user);
        }

        const token = await firebaseUser.getIdToken();
        await createSession(user, token);

        return NextResponse.json({ success: true, user });
      } catch (authError: any) {
        // Handle Firebase Auth errors
        if (authError.code === "auth/user-not-found" || authError.code === "auth/invalid-credential") {
          return NextResponse.json(
            { error: "No account found with this email. Please sign up instead." },
            { status: 404 }
          );
        }
        if (authError.code === "auth/wrong-password") {
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

    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (error.code === "auth/email-already-in-use") {
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

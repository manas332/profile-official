import { NextRequest, NextResponse } from "next/server";
import { otpVerificationSchema } from "@/schemas/auth";
import { verifyOTP, deleteOTP, getUserByEmail } from "@/lib/firebase/firestore";
import { signUpWithEmail, signInWithEmail, convertFirebaseUserToUser } from "@/lib/firebase/auth";
import { createUser, getUser } from "@/lib/firebase/firestore";
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

      // Check if user already exists
      const existingUser = await getUserByEmail(validated.email);
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      // Create user with email/password
      const firebaseUser = await signUpWithEmail(
        validated.email,
        password,
        name
      );

      const user = convertFirebaseUserToUser(firebaseUser);
      await createUser(user);

      const token = await firebaseUser.getIdToken();
      await createSession(user, token);

      return NextResponse.json({ success: true, user });
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

      // Sign in user
      try {
        const firebaseUser = await signInWithEmail(
          validated.email,
          password
        );

        let user = await getUser(firebaseUser.uid);
        if (!user) {
          user = convertFirebaseUserToUser(firebaseUser);
          await createUser(user);
        }

        const token = await firebaseUser.getIdToken();
        await createSession(user, token);

        return NextResponse.json({ success: true, user });
      } catch (authError: any) {
        if (authError.code === "auth/invalid-credential" || authError.code === "auth/wrong-password") {
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

    if (error.message?.includes("Firestore is not enabled")) {
      return NextResponse.json(
        { error: "Database not configured. Please enable Firestore in Firebase Console." },
        { status: 500 }
      );
    }

    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    if (error.code === "auth/email-already-in-use") {
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

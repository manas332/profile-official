import { NextRequest, NextResponse } from "next/server";
import { emailSchema } from "@/schemas/auth";
import { sendOTPEmail } from "@/lib/resend/client";
import { saveOTP, getUserByEmail } from "@/lib/firebase/firestore";
import { generateOTP } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, purpose = "signup" } = body;

    const validated = emailSchema.parse({ email });

    // Only signup uses OTP now, so check if user already exists
    if (purpose === "signup") {
      const existingUser = await getUserByEmail(validated.email);
      if (existingUser) {
        return NextResponse.json(
          { 
            error: "Email already registered. Please login instead.",
            shouldRedirect: true,
            redirectTo: "/login"
          },
          { status: 400 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to Firestore first
    try {
      await saveOTP(validated.email, otp, expiresAt, purpose as "signup" | "login");
      console.log("OTP saved to Firestore for:", validated.email);
    } catch (dbError: any) {
      console.error("Failed to save OTP to Firestore:", dbError);
      return NextResponse.json(
        { error: "Failed to save OTP. Please check if Firestore is enabled." },
        { status: 500 }
      );
    }

    // Send OTP email
    try {
      await sendOTPEmail(validated.email, otp, purpose as "signup" | "login");
      console.log("OTP email sent successfully to:", validated.email);
    } catch (emailError: any) {
      console.error("Failed to send OTP email:", emailError);
      // OTP is saved, but email failed - still return error so user knows
      return NextResponse.json(
        { error: emailError.message || "Failed to send OTP email. Please check your email address and try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully. Please check your email (including spam folder).",
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { emailSchema } from "@/schemas/auth";
import { sendOTPEmail } from "@/lib/aws/ses";
import { saveOTP, getUserByEmail, deleteOTP } from "@/lib/aws/dynamodb";
import { generateOTP } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, purpose = "signup" } = body;

    const validated = emailSchema.parse({ email });

    // For signup, check if user already exists
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
    
    // For login, check if user exists - if not, suggest signup
    if (purpose === "login") {
      const existingUser = await getUserByEmail(validated.email);
      if (!existingUser) {
        return NextResponse.json(
          { 
            error: "No account found with this email. Please sign up first.",
            shouldRedirect: true,
            redirectTo: "/signup"
          },
          { status: 404 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to DynamoDB first
    try {
      await saveOTP(validated.email, otp, expiresAt, purpose as "signup" | "login");
      console.log("OTP saved to DynamoDB for:", validated.email);
    } catch (dbError: any) {
      console.error("Failed to save OTP to DynamoDB:", dbError);
      return NextResponse.json(
        { error: "Failed to save OTP. Please check if DynamoDB tables are created." },
        { status: 500 }
      );
    }

    // Send OTP email
    try {
      await sendOTPEmail(validated.email, otp, purpose as "signup" | "login");
      console.log("✅ OTP email sent successfully to:", validated.email);
    } catch (emailError: any) {
      console.error("❌ Failed to send OTP email:", emailError);
      console.error("Error details:", {
        name: emailError.name,
        message: emailError.message,
        code: emailError.code,
        stack: emailError.stack,
      });
      
      // Delete the saved OTP since email failed
      try {
        await deleteOTP(validated.email);
      } catch (deleteError) {
        console.error("Failed to delete OTP after email failure:", deleteError);
      }
      
      // Provide helpful error message
      let errorMessage = "Failed to send OTP email. ";
      if (emailError.message?.includes("not verified")) {
        errorMessage += "Please verify the sender email in AWS SES console.";
      } else if (emailError.message?.includes("MessageRejected")) {
        errorMessage += "Email address may not be verified in SES. Please check AWS SES console.";
      } else if (emailError.message?.includes("AccountSendingPausedException")) {
        errorMessage += "Email sending is paused. Please check AWS SES console.";
      } else {
        errorMessage += emailError.message || "Please check your email address and try again.";
      }
      
      return NextResponse.json(
        { error: errorMessage },
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

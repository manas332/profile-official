import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set in environment variables");
  throw new Error("RESEND_API_KEY is not set. Please check your .env.local file. Make sure it's RESEND_API_KEY (not NEXT_RESEND_API_KEY)");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string, purpose: "signup" | "login"): Promise<void> {
  const subject = purpose === "signup" 
    ? "Verify your email - Sign Up" 
    : "Verify your email - Login";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
            <h1 style="color: #111827; margin: 0; font-size: 24px; font-weight: 600;">Humara Pandit</h1>
          </div>
          <div style="margin-bottom: 30px;">
            <h2 style="color: #111827; margin-top: 0; margin-bottom: 16px; font-size: 20px; font-weight: 600;">Email Verification</h2>
            <p style="color: #4b5563; margin: 0 0 16px 0;">Hello,</p>
            <p style="color: #4b5563; margin: 0 0 24px 0;">Your OTP for ${purpose === "signup" ? "signing up" : "logging in"} is:</p>
            <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #e5e7eb;">
              <h1 style="color: #111827; font-size: 36px; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace; font-weight: 700;">${otp}</h1>
            </div>
            <p style="color: #6b7280; margin: 16px 0; font-size: 14px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #6b7280; margin: 16px 0 0 0; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">&copy; 2026 Humara Pandit. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: "Humara Pandit <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      throw new Error(result.error.message || "Failed to send email");
    }

    console.log("OTP email sent successfully to:", email);
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    if (error.message?.includes("rate_limit") || error.message?.includes("rate limit")) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    if (error.message?.includes("invalid") || error.message?.includes("domain")) {
      throw new Error("Invalid email address or domain not verified.");
    }
    throw new Error(error.message || "Failed to send OTP email. Please try again.");
  }
}

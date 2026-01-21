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
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to bottom, #FCE181, #FCD575); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0;">AstroConsult</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
          <p>Hello,</p>
          <p>Your OTP for ${purpose === "signup" ? "signing up" : "logging in"} is:</p>
          <div style="background: #FCE181; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>&copy; 2026 AstroConsult. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: "AstroConsult <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      throw new Error(result.error.message || "Failed to send email");
    }

    console.log("OTP email sent successfully to:", email);
    return result;
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

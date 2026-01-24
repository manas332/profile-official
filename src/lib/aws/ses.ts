import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { sesClient } from "./config";

if (!process.env.AWS_SES_FROM_EMAIL) {
  console.error("AWS_SES_FROM_EMAIL is not set in environment variables");
  throw new Error(
    "AWS_SES_FROM_EMAIL is required. Please set it in your .env.local file."
  );
}

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL;

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: "signup" | "login"
): Promise<void> {
  const subject =
    purpose === "signup"
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
    const params: SendEmailCommandInput = {
      Source: `Humara Pandit <${FROM_EMAIL}>`,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);

    if (result.MessageId) {
      console.log("OTP email sent successfully to:", email, "MessageId:", result.MessageId);
    } else {
      throw new Error("Failed to send email - no MessageId returned");
    }
  } catch (error: any) {
    console.error("❌ Error sending OTP email:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });
    
    // Handle AWS SES specific errors
    if (error.name === "MessageRejected" || error.Code === "MessageRejected") {
      const detailedError = `Email sending rejected. This usually means:
1. The sender email (${FROM_EMAIL}) is not verified in AWS SES
2. Or you're in sandbox mode and the recipient email is not verified
3. Check AWS SES Console → Verified identities`;
      console.error(detailedError);
      throw new Error(detailedError);
    }
    if (error.name === "MailFromDomainNotVerifiedException" || error.Code === "MailFromDomainNotVerifiedException") {
      throw new Error(`Sender email domain is not verified in SES. Please verify ${FROM_EMAIL} in AWS SES Console.`);
    }
    if (error.name === "AccountSendingPausedException" || error.Code === "AccountSendingPausedException") {
      throw new Error("Account sending is paused. Please check AWS SES Console → Account dashboard.");
    }
    if (error.name === "SendingPausedException" || error.Code === "SendingPausedException") {
      throw new Error("Sending is paused for this account. Please check AWS SES Console.");
    }
    if (error.message?.includes("rate") || error.message?.includes("throttl") || error.Code === "Throttling") {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    
    // Provide more detailed error message
    const errorMsg = error.message || error.Code || "Failed to send OTP email";
    throw new Error(`${errorMsg}. Check AWS SES Console and verify ${FROM_EMAIL} is verified.`);
  }
}

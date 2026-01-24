# OTP Email Troubleshooting Guide

## Issue: No OTP Email Received

If you're not receiving OTP emails, follow these steps:

### Step 1: Verify Sender Email in AWS SES

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Make sure you're in the correct region: **ap-south-1 (Mumbai)**
3. Go to **Verified identities**
4. Check if `manas@humarapandit.com` is listed and verified
5. If not verified:
   - Click **Create identity**
   - Choose **Email address**
   - Enter `manas@humarapandit.com`
   - Click **Create identity**
   - Check your email and click the verification link

### Step 2: Check SES Sandbox Mode

If you're in **Sandbox mode** (default for new SES accounts):
- You can ONLY send emails to verified email addresses
- To send to any email, request production access:
  1. Go to SES Console → Account dashboard
  2. Click **Request production access**
  3. Fill out the form and submit
  4. Usually approved within 24 hours

### Step 3: Check Server Logs

Check your Next.js server console for error messages:
- Look for `❌ Error sending OTP email`
- Check the error details (name, code, message)
- Common errors:
  - `MessageRejected` - Email not verified
  - `MailFromDomainNotVerifiedException` - Sender not verified
  - `AccountSendingPausedException` - Account paused

### Step 4: Verify Environment Variables

Make sure `.env.local` has:
```env
AWS_SES_FROM_EMAIL=manas@humarapandit.com
AWS_SES_REGION=ap-south-1
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

### Step 5: Check IAM Permissions

Your AWS IAM user needs:
```json
{
  "Effect": "Allow",
  "Action": [
    "ses:SendEmail",
    "ses:SendRawEmail"
  ],
  "Resource": "*"
}
```

### Step 6: Test Email Sending

1. Try signing up with a **verified email address** (if in sandbox)
2. Check spam/junk folder
3. Check AWS SES Console → **Sending statistics** for delivery status
4. Check **Suppression list** if emails are being blocked

## Issue: 403 Error - "You signed up via Google"

This happens when:
- You signed up using Google OAuth
- You're trying to login with email/password
- The system detects you're a Google user

### Solutions:

1. **Use Google Sign-In** (Recommended)
   - Click the Google sign-in button
   - This is the fastest way

2. **Use OTP Verification**
   - Click "Or verify via OTP instead" button on login page
   - Enter your email
   - Check email for OTP
   - Enter OTP to verify email ownership
   - Then complete Google sign-in

3. **Reset Account** (If needed)
   - Delete user from DynamoDB `users` table
   - Delete user from Cognito User Pool
   - Sign up again with email/password

## Common Error Messages

### "Email address is not verified or rejected"
- **Fix:** Verify the sender email in SES Console
- **Fix:** If in sandbox, verify recipient email too

### "Sender email domain is not verified"
- **Fix:** Verify the domain `humarapandit.com` in SES, or verify the specific email

### "Account sending is paused"
- **Fix:** Go to SES Console → Account dashboard → Resume sending

### "Too many requests"
- **Fix:** Wait a few minutes and try again
- **Fix:** Check SES sending limits

### "OTP not found"
- **Fix:** OTP expired (10 minutes) or wasn't saved
- **Fix:** Request a new OTP
- **Fix:** Check DynamoDB `otp_codes` table exists

## Quick Checklist

- [ ] Sender email verified in SES
- [ ] Recipient email verified (if in sandbox)
- [ ] Environment variables set correctly
- [ ] IAM permissions correct
- [ ] Not in spam folder
- [ ] Check server console for errors
- [ ] SES account not paused
- [ ] DynamoDB tables exist (`users`, `otp_codes`)

## Still Not Working?

1. Check AWS CloudWatch logs for detailed errors
2. Test SES directly using AWS CLI:
   ```bash
   aws ses send-email \
     --from manas@humarapandit.com \
     --to your-test@email.com \
     --subject "Test" \
     --text "Test message" \
     --region ap-south-1
   ```
3. Verify AWS credentials are correct
4. Check if your domain has SPF/DKIM records set up (for production)

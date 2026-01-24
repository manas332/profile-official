# Quick Fix: Verify Email in AWS SES

## The Problem
Your email `manas@humarapandit.com` is **NOT verified** in AWS SES, so emails are being rejected.

## Quick Fix (5 minutes)

### Step 1: Go to AWS SES Console
1. Open: https://console.aws.amazon.com/ses/
2. **IMPORTANT:** Make sure region is **ap-south-1 (Mumbai)** (top right corner)

### Step 2: Verify Your Email
1. Click **"Verified identities"** in the left sidebar
2. Click **"Create identity"** button (top right)
3. Select **"Email address"**
4. Enter: `manas@humarapandit.com`
5. Click **"Create identity"**

### Step 3: Check Your Email
1. Go to your email inbox for `manas@humarapandit.com`
2. Look for an email from AWS SES (might be in spam)
3. Click the verification link in the email
4. You should see "Email address verified" message

### Step 4: Test Again
1. Go back to your app
2. Try signing up again
3. OTP should be sent successfully!

## If You're in Sandbox Mode

**Sandbox mode** means you can ONLY send to verified emails.

### Option A: Verify Recipient Email Too
- If testing, also verify the recipient email address in SES
- Then you can send OTP to that email

### Option B: Request Production Access (Recommended)
1. In SES Console, go to **"Account dashboard"**
2. Click **"Request production access"**
3. Fill out the form:
   - **Mail Type:** Transactional
   - **Website URL:** Your website URL
   - **Use case:** "Sending OTP verification emails for user authentication"
   - Answer compliance questions
4. Submit (usually approved in 24 hours)
5. Once approved, you can send to ANY email address

## Verify It's Working

After verifying, check:
1. SES Console → Verified identities → Should show `manas@humarapandit.com` with ✅ Verified status
2. Try sending OTP again
3. Check server console - should see `✅ OTP email sent successfully`

## Still Not Working?

1. **Double-check region** - Must be `ap-south-1`
2. **Check spam folder** - Verification email might be there
3. **Wait a few minutes** - Verification can take 1-2 minutes to propagate
4. **Check IAM permissions** - Make sure your AWS user has `ses:SendEmail` permission

## Quick Checklist

- [ ] Opened SES Console in `ap-south-1` region
- [ ] Created identity for `manas@humarapandit.com`
- [ ] Clicked verification link in email
- [ ] Email shows as "Verified" in SES Console
- [ ] Tried sending OTP again

That's it! Once verified, OTP emails will work immediately.

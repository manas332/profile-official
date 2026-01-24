# AWS SES Setup Guide

## Overview
This guide will help you set up AWS SES (Simple Email Service) to send OTP emails, replacing Resend.

## Step 1: Verify Email Address or Domain

### Option A: Verify Email Address (Sandbox Mode - Recommended for Testing)

1. Go to AWS Console → SES → Verified identities
2. Select region: **ap-south-1 (Mumbai)**
3. Click "Create identity"
4. Choose "Email address"
5. Enter your email (e.g., `noreply@yourdomain.com`)
6. Click "Create identity"
7. Check your email and click the verification link

**Note:** In sandbox mode, you can only send emails to verified addresses.

### Option B: Verify Domain (Production)

1. Go to AWS Console → SES → Verified identities
2. Click "Create identity"
3. Choose "Domain"
4. Enter your domain (e.g., `yourdomain.com`)
5. Follow DNS verification steps:
   - Add CNAME records to your domain's DNS
   - Wait for verification (can take up to 72 hours)

## Step 2: Request Production Access (If Needed)

If you want to send emails to unverified addresses:

1. Go to AWS Console → SES → Account dashboard
2. Click "Request production access"
3. Fill out the form:
   - **Mail Type:** Transactional
   - **Website URL:** Your website URL
   - **Use case description:** "Sending OTP verification emails for user authentication"
   - **Compliance:** Answer questions about email content
4. Submit request (usually approved within 24 hours)

## Step 3: Configure IAM Permissions

Your AWS IAM user/role needs SES permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step 4: Environment Variables

Add to your `.env.local`:

```env
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_SES_REGION=ap-south-1
```

**Important:** The `AWS_SES_FROM_EMAIL` must be a verified email address or from a verified domain.

## Step 5: Test Email Sending

1. Start your Next.js app
2. Try signing up a new user
3. Check if OTP email is received
4. Check CloudWatch logs if email fails

## Cost Considerations

- **Free Tier:** 62,000 emails/month (if sent from EC2), then $0.10 per 1,000 emails
- **Sandbox Mode:** Free, but limited to verified addresses
- **Production:** Pay per email after free tier

## Troubleshooting

- **"Email address not verified":** Verify the sender email in SES console
- **"MessageRejected":** Check if you're in sandbox mode and trying to send to unverified address
- **"AccountSendingPausedException":** Your account sending is paused, check SES console
- **Emails going to spam:** Set up SPF, DKIM, and DMARC records for your domain

## Best Practices

1. **Use a subdomain for sending:** e.g., `noreply@mail.yourdomain.com`
2. **Set up SPF record:** `v=spf1 include:amazonses.com ~all`
3. **Set up DKIM:** AWS SES provides DKIM keys in console
4. **Monitor bounce/complaint rates:** Keep them below 5% and 0.1% respectively
5. **Use dedicated IP (optional):** For high-volume sending

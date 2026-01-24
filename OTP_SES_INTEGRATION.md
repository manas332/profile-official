# OTP-Based Authentication with AWS SES Integration

## Overview

This document explains how OTP-based login and registration works with AWS SES, Cognito, and DynamoDB integration.

## Architecture

The OTP authentication flow integrates three AWS services:

1. **AWS SES (Simple Email Service)** - Sends OTP emails
2. **AWS Cognito** - Manages user authentication and sessions
3. **AWS DynamoDB** - Stores user data and OTP codes

## Flow Diagram

### Signup Flow
```
User enters email → OTP sent via SES → User enters OTP → 
User created in Cognito (auto-confirmed) → User created in DynamoDB → 
Session created → User logged in
```

### Login Flow
```
User enters email → OTP sent via SES → User enters OTP → 
Email verified → User confirmed in Cognito → 
User signs in with password → Session created → User logged in
```

## Key Features

### 1. Email Verification via OTP
- OTP is sent using AWS SES
- OTP is stored in DynamoDB with TTL (10 minutes expiration)
- After OTP verification, email is automatically marked as verified in Cognito

### 2. Auto-Confirmation
- When users sign up via OTP, they are automatically confirmed in Cognito
- No need for separate email confirmation step
- Email is marked as verified since OTP already verified ownership

### 3. Multi-Provider Support
- Works seamlessly with Google sign-in
- Users who sign up via Google can verify their email via OTP
- Provider information is tracked in DynamoDB

### 4. Synchronization
- User data is synchronized between Cognito and DynamoDB
- If user exists in Cognito but not DynamoDB, DynamoDB record is created
- If user exists in DynamoDB but not Cognito, appropriate action is taken

## API Endpoints

### 1. Send OTP (`POST /api/resend`)
- **Purpose:** Send OTP to user's email
- **Body:** `{ email: string, purpose: "signup" | "login" }`
- **Response:** `{ success: true, message: string }`

### 2. Verify OTP (`POST /api/auth/verify-otp`)
- **Purpose:** Verify OTP and complete signup/login
- **Body:** 
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "password": "password123",
    "name": "User Name", // Required for signup
    "purpose": "signup" | "login"
  }
  ```
- **Response:** `{ success: true, user: User }`

## Implementation Details

### OTP Storage
- **Table:** `otp_codes` (DynamoDB)
- **Partition Key:** `email`
- **TTL:** `ttl` attribute (automatically deletes expired OTPs)
- **Expiration:** 10 minutes

### User Creation
When a user signs up via OTP:
1. OTP is verified
2. User is created in Cognito using `AdminCreateUser` (auto-confirmed)
3. Password is set using `AdminSetUserPassword`
4. Email is marked as verified
5. User record is created in DynamoDB
6. Session is created

### User Login
When a user logs in via OTP:
1. OTP is verified
2. User is confirmed in Cognito (if not already)
3. User signs in with password
4. Session is created

### Google User OTP Verification
When a Google user verifies email via OTP:
1. OTP is verified
2. User is confirmed in Cognito
3. User is redirected to complete Google sign-in
4. No password is required

## Environment Variables

Required environment variables:

```env
# AWS SES
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
AWS_SES_REGION=ap-south-1

# AWS Cognito
AWS_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your_client_id
AWS_COGNITO_CLIENT_SECRET=your_client_secret

# AWS DynamoDB
AWS_DYNAMODB_USERS_TABLE=users
AWS_DYNAMODB_OTP_TABLE=otp_codes

# AWS Credentials
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## IAM Permissions

Your AWS IAM user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:SignUp",
        "cognito-idp:InitiateAuth",
        "cognito-idp:GetUser",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:ses:ap-south-1:*:*",
        "arn:aws:cognito-idp:ap-south-1:*:userpool/*",
        "arn:aws:dynamodb:ap-south-1:*:table/users",
        "arn:aws:dynamodb:ap-south-1:*:table/users/index/email-index",
        "arn:aws:dynamodb:ap-south-1:*:table/otp_codes"
      ]
    }
  ]
}
```

## Setup Steps

1. **Verify Email/Domain in SES**
   - Go to AWS Console → SES → Verified identities
   - Verify your email address or domain
   - See [SES_SETUP.md](./SES_SETUP.md) for details

2. **Create DynamoDB Tables**
   - Create `users` table with `id` as partition key
   - Create `email-index` GSI on `users` table
   - Create `otp_codes` table with `email` as partition key and TTL enabled
   - See [DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md) for details

3. **Configure Cognito**
   - Set up Cognito User Pool
   - Enable USER_PASSWORD_AUTH flow
   - See [COGNITO_SETUP.md](./COGNITO_SETUP.md) for details

4. **Set Environment Variables**
   - Add all required environment variables to `.env.local`
   - Make sure `AWS_SES_FROM_EMAIL` is a verified email/domain

5. **Test the Flow**
   - Try signing up with a new email
   - Check email for OTP
   - Verify OTP and complete signup
   - Try logging in with OTP

## Troubleshooting

### OTP Not Received
- Check SES console for bounce/complaint rates
- Verify sender email is verified in SES
- Check spam folder
- Verify AWS credentials have SES permissions

### "OTP not found" Error
- Check if OTP table exists in DynamoDB
- Verify TTL is not expiring too quickly
- Check DynamoDB permissions

### "User already exists" Error
- User might exist in Cognito but not DynamoDB
- Check both systems
- Use appropriate login/signup flow

### "Email not verified" Error
- User might not be confirmed in Cognito
- OTP verification should auto-confirm
- Check Cognito admin permissions

### Cognito Errors
- Verify IAM permissions include admin operations
- Check USER_POOL_ID and CLIENT_ID
- Ensure USER_PASSWORD_AUTH flow is enabled

## Best Practices

1. **OTP Expiration:** Keep OTP expiration short (10 minutes recommended)
2. **Rate Limiting:** Implement rate limiting for OTP requests
3. **Email Verification:** Always verify sender email/domain in SES
4. **Error Handling:** Provide clear error messages to users
5. **Logging:** Log OTP generation and verification for debugging
6. **Security:** Never log OTP codes in production
7. **TTL:** Use DynamoDB TTL for automatic OTP cleanup

## Integration with Google Sign-In

The OTP system works seamlessly with Google sign-in:

- Google users can verify their email via OTP
- OTP verification confirms email ownership
- User still needs to complete Google sign-in for session
- Provider information is tracked in DynamoDB

## Next Steps

1. Implement rate limiting for OTP requests
2. Add OTP resend functionality with cooldown
3. Add SMS OTP option (using AWS SNS)
4. Implement account recovery flow
5. Add 2FA support for existing users

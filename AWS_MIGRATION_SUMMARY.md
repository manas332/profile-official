# AWS Migration Summary

## Migration Complete ✅

All services have been successfully migrated from Firebase/Resend to AWS ecosystem.

## What Was Migrated

### 1. Email Service: Resend → AWS SES ✅
- **File Created:** `src/lib/aws/ses.ts`
- **File Updated:** `src/app/api/resend/route.ts`
- **Setup Guide:** See `SES_SETUP.md`

### 2. Database: Firestore → DynamoDB ✅
- **File Created:** `src/lib/aws/dynamodb.ts`
- **Files Updated:**
  - `src/app/api/resend/route.ts`
  - `src/app/api/auth/email/route.ts`
  - `src/app/api/auth/verify-otp/route.ts`
  - `src/app/api/auth/google/route.ts`
- **Setup Guide:** See `DYNAMODB_SETUP.md`

### 3. Authentication: Firebase Auth → AWS Cognito (with Amplify) ✅
- **File Created:** 
  - `src/lib/aws/cognito.ts` (token utilities - shared)
  - `src/lib/aws/cognito-client.ts` (client-side - uses Amplify)
  - `src/lib/aws/cognito-server.ts` (server-side - uses AWS SDK)
  - `src/lib/aws/amplify-config.ts` (Amplify configuration)
  - `src/components/providers/AmplifyProvider.tsx` (Amplify provider)
  - `src/app/api/auth/cognito/callback/route.ts` (OAuth callback)
- **Files Updated:**
  - `src/app/api/auth/email/route.ts`
  - `src/app/api/auth/verify-otp/route.ts`
  - `src/app/api/auth/google/route.ts`
  - `src/hooks/useAuth.ts`
  - `src/components/auth/GoogleSignInButton.tsx`
- **Setup Guide:** See `COGNITO_SETUP.md`

## New File Structure

```
src/lib/
  aws/
    config.ts              # AWS SDK configuration
    ses.ts                 # Email service (SES)
    dynamodb.ts            # Database (DynamoDB)
    cognito.ts             # Token utilities (shared)
    cognito-client.ts      # Client-side (Amplify)
    cognito-server.ts      # Server-side (AWS SDK)
    amplify-config.ts      # Amplify configuration
  firebase/                # Legacy (can be removed after testing)
    config.ts
    firestore.ts
    auth.ts
  resend/                  # Legacy (can be removed after testing)
    client.ts
src/components/
  providers/
    AmplifyProvider.tsx    # Amplify provider for root layout
```

## Environment Variables Required

See `ENV_TEMPLATE.txt` for complete list. Key variables:

### AWS Core
- `AWS_REGION=ap-south-1`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### DynamoDB
- `AWS_DYNAMODB_USERS_TABLE=users`
- `AWS_DYNAMODB_OTP_TABLE=otp_codes`

### SES
- `AWS_SES_FROM_EMAIL`

### Cognito (Server)
- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_COGNITO_CLIENT_SECRET` (optional)

### Cognito (Client - for Amplify)
- `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_AWS_COGNITO_DOMAIN`
- `NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI`
- `NEXT_PUBLIC_AWS_COGNITO_SIGNOUT_URI`
- `NEXT_PUBLIC_AWS_REGION`

## Next Steps

### 1. AWS Console Setup
Follow these guides in order:
1. **SES Setup** (`SES_SETUP.md`) - Verify email/domain
2. **DynamoDB Setup** (`DYNAMODB_SETUP.md`) - Create tables
3. **Cognito Setup** (`COGNITO_SETUP.md`) - Create user pool, configure OAuth

### 2. Environment Configuration
1. Copy `ENV_TEMPLATE.txt` to `.env.local`
2. Fill in all AWS credentials and configuration values
3. Restart your Next.js dev server

### 3. Testing
Test each service:
- **SES:** Sign up a new user, verify OTP email is received
- **DynamoDB:** Check that users and OTPs are stored correctly
- **Cognito:** Test email/password signup and login
- **Cognito OAuth:** Test Google sign-in flow

### 4. Cleanup (After Testing)
Once everything works:
1. Remove Firebase dependencies: `npm uninstall firebase`
2. Remove Resend dependency: `npm uninstall resend`
3. Optionally delete `src/lib/firebase/` and `src/lib/resend/` directories
4. Remove Firebase/Resend environment variables from `.env.local`

## Important Notes

### Cognito with Amplify
- **Client-side**: Uses AWS Amplify for simpler authentication
- **Server-side**: Uses AWS SDK directly for API routes
- **Hybrid Approach**: Best of both worlds - simple client code with server control

### Cognito Signup Flow
- Cognito requires email confirmation by default
- Users will need to confirm their email before they can sign in
- You can auto-confirm users using Admin APIs if needed (see `cognito-server.ts`)

### Amplify Benefits
- Automatic token refresh
- Simpler OAuth flows
- Better React integration
- Less boilerplate code

### DynamoDB GSI
- The `getUserByEmail` function requires a GSI named `email-index` on the `users` table
- Make sure to create this index in DynamoDB console (see `DYNAMODB_SETUP.md`)

### OAuth Callback
- Google OAuth uses Cognito Hosted UI
- Callback URL must match exactly in Cognito settings
- Default callback: `/api/auth/cognito/callback`

## Troubleshooting

### Common Issues

1. **"Table not found"** → Create DynamoDB tables (see `DYNAMODB_SETUP.md`)
2. **"Email not verified"** → Verify sender email in SES console
3. **"Invalid redirect URI"** → Check callback URL in Cognito settings
4. **"User pool not found"** → Verify `AWS_COGNITO_USER_POOL_ID` in env
5. **"GSI not found"** → Create `email-index` GSI on `users` table

### Getting Help

- Check AWS CloudWatch logs for detailed error messages
- Verify IAM permissions for all services
- Ensure all environment variables are set correctly
- Review setup guides for each service

## Cost Estimates

- **SES:** Free tier: 62,000 emails/month, then $0.10/1,000
- **DynamoDB:** Free tier: 25 GB storage, 25 RCU/WCU, then pay-per-use
- **Cognito:** Free tier: 50,000 MAU, then $0.0055/MAU

All services have generous free tiers for development and small-scale production.

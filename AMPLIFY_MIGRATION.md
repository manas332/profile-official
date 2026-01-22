# AWS Amplify Migration Guide

## Overview

The Cognito authentication has been refactored to use **AWS Amplify** for client-side operations, while keeping AWS SDK for server-side API routes. This provides the best of both worlds:

- **Client-side**: Simple Amplify hooks and functions
- **Server-side**: Direct AWS SDK control for API routes

## What Changed

### Client-Side (Using Amplify)
- ✅ `GoogleSignInButton` - Now uses `signIn({ provider: "Google" })` from Amplify
- ✅ `useAuth` hook - Now uses Amplify's `getCurrentUserClient()` and `signOutClient()`
- ✅ `AmplifyProvider` - Added to root layout to initialize Amplify
- ✅ `amplify-config.ts` - Amplify configuration file

### Server-Side (Using AWS SDK)
- ✅ API routes still use AWS SDK directly (for server-side control)
- ✅ `cognito-server.ts` - Server-side functions for API routes
- ✅ `cognito.ts` - Token decoding utilities (shared)

## File Structure

```
src/lib/aws/
  amplify-config.ts      # Amplify configuration (client-side)
  cognito.ts             # Token utilities (shared)
  cognito-client.ts     # Client-side Amplify functions
  cognito-server.ts     # Server-side AWS SDK functions
  config.ts             # AWS SDK configuration
  ses.ts                # Email service
  dynamodb.ts           # Database
```

## Setup

### 1. Install Dependencies
Already installed:
- `aws-amplify`
- `@aws-amplify/ui-react`

### 2. Environment Variables
Make sure these are set in `.env.local`:

```env
# Amplify/Cognito (Client-side - must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_AWS_COGNITO_DOMAIN=your-domain.auth.ap-south-1.amazoncognito.com
NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI=http://localhost:3000/api/auth/cognito/callback
NEXT_PUBLIC_AWS_COGNITO_SIGNOUT_URI=http://localhost:3000/login

# Cognito (Server-side)
AWS_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your_client_id_here
AWS_COGNITO_CLIENT_SECRET=your_client_secret_if_used
```

### 3. Amplify Configuration
The Amplify configuration is automatically loaded via `AmplifyProvider` in the root layout.

## Usage

### Client-Side Authentication

#### Sign Up with Email
```typescript
import { signUpWithEmail } from "@/lib/aws/cognito-client";

const result = await signUpWithEmail(email, password, name);
// Then send token to server to create session
```

#### Sign In with Email
```typescript
import { signInWithEmail } from "@/lib/aws/cognito-client";

const { idToken } = await signInWithEmail(email, password);
// Then send token to server
```

#### Google OAuth
```typescript
import { signIn } from "aws-amplify/auth";

await signIn({ provider: "Google" });
// Automatically redirects to Cognito Hosted UI
```

#### Get Current User
```typescript
import { getCurrentUserClient } from "@/lib/aws/cognito-client";

const user = await getCurrentUserClient();
```

#### Sign Out
```typescript
import { signOutClient } from "@/lib/aws/cognito-client";

await signOutClient();
```

### Server-Side (API Routes)

API routes continue to use AWS SDK directly:

```typescript
import { signUpWithEmail, signInWithEmail } from "@/lib/aws/cognito-server";
import { getUserFromIdToken } from "@/lib/aws/cognito";

// Server-side signup/login
const result = await signUpWithEmail(email, password, name);
const authResult = await signInWithEmail(email, password);

// Decode token
const user = getUserFromIdToken(authResult.idToken);
```

## Benefits of Amplify

1. **Simpler Client Code**: Less boilerplate, cleaner hooks
2. **Automatic Token Refresh**: Amplify handles token refresh automatically
3. **Better OAuth Flow**: Built-in OAuth handling with redirects
4. **React Integration**: Optional UI components available
5. **Type Safety**: Better TypeScript support

## Migration Notes

- **Backward Compatible**: API routes still work the same way
- **Client Components**: Now use Amplify instead of direct SDK calls
- **OAuth Callback**: Still handled by `/api/auth/cognito/callback`
- **Session Management**: Hybrid approach - Amplify on client, server sessions for API

## Troubleshooting

### "Amplify not configured"
- Make sure `AmplifyProvider` is in root layout
- Check that `amplify-config.ts` is imported

### "OAuth redirect not working"
- Verify `NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI` matches Cognito settings
- Check that callback route exists at `/api/auth/cognito/callback`

### "Token not found"
- Ensure user is signed in via Amplify
- Check that tokens are being sent to server correctly

## Next Steps

1. Test Google OAuth flow
2. Test email/password signup and login
3. Verify session management works correctly
4. Test token refresh (Amplify handles this automatically)

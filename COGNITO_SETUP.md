# AWS Cognito Setup Guide

## Overview
This guide will help you set up AWS Cognito User Pool for authentication with email/password and Google OAuth.

## Step 1: Create Cognito User Pool

1. Go to AWS Console → Cognito → User Pools
2. Select region: **ap-south-1 (Mumbai)**
3. Click "Create user pool"
4. Choose "Cognito user pool" (not "Federated identity")

### Configuration Steps:

#### Sign-in experience
- **Sign-in options:** Select "Email" and "Username" (or just "Email")
- **Federated identity provider sign-in:** Check "Google" (we'll configure this later)

#### Configure security requirements
- **Password policy:** Choose your requirements (or use defaults)
- **Multi-factor authentication:** Optional (can enable later)

#### Configure sign-up experience
- **Self-service sign-up:** Enable
- **Cognito-assisted verification:** Enable (for email verification)
- **Required attributes:** Select "email" and optionally "name"
- **Custom attributes:** None needed for basic setup

#### Configure message delivery
- **Email provider:** Choose "Send email with Cognito" (or configure SES later)
- **From email address:** Use Cognito default or configure SES

#### Integrate your app
- **User pool name:** e.g., "humara-pandit-users"
- **App client name:** e.g., "humara-pandit-web"
- **Client secret:** Choose "Don't generate a client secret" (for web apps) or generate one if needed

#### Review and create
- Review settings and click "Create user pool"

## Step 2: Configure Google OAuth Provider

1. In your User Pool, go to "Sign-in experience" → "Federated identity provider sign-in"
2. Click "Add identity provider" → "Google"
3. You'll need:
   - **Google Client ID:** Get from [Google Cloud Console](https://console.cloud.google.com/)
   - **Google Client Secret:** Get from Google Cloud Console
4. **Authorized scopes:** `openid email profile`
5. Click "Add identity provider"

### Google Cloud Console Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: 
   - `https://your-cognito-domain.auth.ap-south-1.amazoncognito.com/oauth2/idpresponse`
7. Copy Client ID and Client Secret toc Cognito

## Step 3: Configure App Client

1. In User Pool, go to "App integration" → "App clients"
2. Click on your app client
3. **Hosted UI settings:**
   - Enable "Hosted UI"
   - **Allowed callback URLs:** 
     - `http://localhost:3000/api/auth/cognito/callback` (for dev)
     - `https://yourdomain.com/api/auth/cognito/callback` (for production)
   - **Allowed sign-out URLs:**
     - `http://localhost:3000/login` (for dev)
     - `https://yourdomain.com/login` (for production)
   - **Identity providers:** Select "Google" and "Cognito user pool"
   - **OAuth 2.0 grant types:** Select "Authorization code grant"
   - **OpenID Connect scopes:** Select "openid", "email", "profile"

## Step 4: Set Up Cognito Domain

1. In User Pool, go to "App integration" → "Domain"
2. Click "Create Cognito domain" or "Use your own domain"
3. Enter a domain prefix (e.g., "humara-pandit-auth")
4. Domain will be: `humara-pandit-auth.auth.ap-south-1.amazoncognito.com`
5. Save the domain name for your `.env.local`

## Step 5: Environment Variables

Add these to your `.env.local`:

```env
# Server-side
AWS_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your_client_id_here
AWS_COGNITO_CLIENT_SECRET=your_client_secret_if_used

# Client-side (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_AWS_COGNITO_DOMAIN=humara-pandit-auth.auth.ap-south-1.amazoncognito.com
NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI=http://localhost:3000/api/auth/cognito/callback
```

## Step 6: IAM Permissions

Your AWS IAM user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:SignUp",
        "cognito-idp:InitiateAuth",
        "cognito-idp:GetUser",
        "cognito-idp:GlobalSignOut"
      ],
      "Resource": "arn:aws:cognito-idp:ap-south-1:*:userpool/*"
    }
  ]
}
```

## Testing

1. Start your Next.js app
2. Try signing up with email/password
3. Try signing in with Google (should redirect to Cognito Hosted UI)

## Troubleshooting

- **"Invalid redirect URI":** Make sure callback URL matches exactly in Cognito settings
- **"User pool not found":** Check USER_POOL_ID in environment variables
- **"Client not found":** Check CLIENT_ID in environment variables
- **Google OAuth not working:** Verify Google Client ID/Secret and redirect URIs match

// AWS Amplify Configuration
// This file configures Amplify for Cognito authentication

import { Amplify } from "aws-amplify";

if (!process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID) {
  console.warn("NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID is not set");
}

if (!process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID) {
  console.warn("NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID is not set");
}

const redirectSignIn = process.env.NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI || 
  (typeof window !== "undefined" ? `${window.location.origin}/api/auth/cognito/callback` : "");

const redirectSignOut = process.env.NEXT_PUBLIC_AWS_COGNITO_SIGNOUT_URI || 
  (typeof window !== "undefined" ? `${window.location.origin}/login` : "");

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID || "",
      region: process.env.AWS_REGION || "ap-south-1",
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN || "",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: "code" as const,
          providers: ["Google" as any],
        },
      },
    },
  },
};

// Configure Amplify (only on client-side)
if (typeof window !== "undefined") {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig;

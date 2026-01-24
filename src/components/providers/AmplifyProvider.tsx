"use client";

import { useEffect } from "react";
import { Amplify } from "aws-amplify";

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure Amplify on client-side only
    if (typeof window !== "undefined") {
      const config = {
        Auth: {
          Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_APP_AWS_COGNITO_USER_POOL_ID || "",
            userPoolClientId: process.env.NEXT_PUBLIC_APP_AWS_COGNITO_CLIENT_ID || "",
            region: process.env.NEXT_PUBLIC_APP_AWS_REGION || "ap-south-1",
            loginWith: {
              oauth: {
                domain: process.env.NEXT_PUBLIC_APP_AWS_COGNITO_DOMAIN || "",
                scopes: ["openid", "email", "profile"],
                redirectSignIn: [
                  process.env.NEXT_PUBLIC_APP_AWS_COGNITO_REDIRECT_URI || 
                  `${window.location.origin}/api/auth/cognito/callback`
                ],
                redirectSignOut: [
                  process.env.NEXT_PUBLIC_APP_AWS_COGNITO_SIGNOUT_URI || 
                  `${window.location.origin}/login`
                ],
                responseType: "code" as const,
                providers: ["Google" as any],
              },
            },
          },
        },
      };
      
      Amplify.configure(config);
    }
  }, []);

  return <>{children}</>;
}

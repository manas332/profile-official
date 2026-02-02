"use client";

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    // Configure Amplify on client-side only
    if (typeof window !== "undefined" && !configured) {
      const redirectSignInUrl = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_REDIRECT_URI || `${window.location.origin}/login`;
      const redirectSignOutUrl = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_SIGNOUT_URI || `${window.location.origin}/login`;
      const cognitoDomain = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_DOMAIN || "";
      const userPoolId = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_USER_POOL_ID || "";
      const clientId = process.env.NEXT_PUBLIC_APP_AWS_COGNITO_CLIENT_ID || "";



      const config = {
        Auth: {
          Cognito: {
            userPoolId: userPoolId,
            userPoolClientId: clientId,
            loginWith: {
              oauth: {
                domain: cognitoDomain,
                scopes: ["openid", "email", "profile"],
                redirectSignIn: [redirectSignInUrl],
                redirectSignOut: [redirectSignOutUrl],
                responseType: "code" as const,
                providers: ["Google" as const],
              },
            },
          },
        },
      };



      Amplify.configure(config);
      setConfigured(true);


    }
  }, [configured]);

  if (!configured) {
    return null; // or a loading spinner
  }

  return (
    <Authenticator.Provider>
      {children}
    </Authenticator.Provider>
  );
}
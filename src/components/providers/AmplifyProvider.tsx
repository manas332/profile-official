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

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/8a23d420-907e-4e4f-add4-9173193b5450', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AmplifyProvider.tsx:useEffect', message: 'Amplify config values', data: { redirectSignInUrl, redirectSignOutUrl, cognitoDomain, userPoolId, clientId, windowOrigin: window.location.origin, envRedirectUri: process.env.NEXT_PUBLIC_APP_AWS_COGNITO_REDIRECT_URI }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A,B' }) }).catch(() => { });
      // #endregion

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

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/8a23d420-907e-4e4f-add4-9173193b5450', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AmplifyProvider.tsx:beforeConfigure', message: 'Full Amplify config', data: { config: JSON.stringify(config) }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A,C' }) }).catch(() => { });
      // #endregion

      Amplify.configure(config);
      setConfigured(true);

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/8a23d420-907e-4e4f-add4-9173193b5450', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AmplifyProvider.tsx:afterConfigure', message: 'Amplify configured successfully', data: { configured: true }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
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

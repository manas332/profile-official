"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCodeVerifier, clearCodeVerifier } from "@/lib/aws/oauth-pkce";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const run = async () => {
      const error = params.get("error");
      if (error) {
        const desc = params.get("error_description");
        const q = desc ? `error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(desc)}` : `error=${encodeURIComponent(error)}`;
        router.replace(`/login?${q}`);
        return;
      }

      const code = params.get("code");
      const state = params.get("state");
      
      if (!code || !state) {
        router.replace("/login?error=no_code_or_state");
        return;
      }

      try {
        // Get code_verifier from sessionStorage
        const codeVerifier = getCodeVerifier(state);
        if (!codeVerifier) {
          console.error("No code_verifier found for state:", state);
          router.replace("/login?error=invalid_state");
          return;
        }

        // Exchange code for tokens manually (workaround for Amplify v6 bug)
        const clientId = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
        const domain = process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN;
        const redirectUri = process.env.NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI;

        if (!clientId || !domain || !redirectUri) {
          throw new Error("Missing Cognito configuration");
        }

        setMessage("Exchanging authorization code...");

        // Use server-side token exchange (can safely use client secret)
        const tokenResponse = await fetch("/api/auth/cognito/token-exchange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}));
          console.error("Token exchange failed:", errorData);
          clearCodeVerifier(state);
          router.replace(`/login?error=${encodeURIComponent((errorData as { error?: string }).error || "token_exchange_failed")}`);
          return;
        }

        const tokenData = await tokenResponse.json();
        const idToken = tokenData.id_token;

        if (!idToken) {
          clearCodeVerifier(state);
          router.replace("/login?error=no_token");
          return;
        }

        // Clear code_verifier after successful exchange
        clearCodeVerifier(state);

        setMessage("Creating your session...");

        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          router.replace(`/login?error=${encodeURIComponent((data as { error?: string }).error || "session_failed")}`);
          return;
        }

        router.replace("/astro");
      } catch (e: any) {
        console.error("Auth callback error:", e);
        if (state) clearCodeVerifier(state);
        router.replace(`/login?error=${encodeURIComponent(e?.message || "oauth_failed")}`);
      }
    };
    run();
  }, [router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

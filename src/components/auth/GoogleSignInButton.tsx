"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  storeCodeVerifier,
} from "@/lib/aws/oauth-pkce";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Manual OAuth flow with PKCE (workaround for Amplify v6 OAuth completion bug)
      const clientId = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID;
      const domain = process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN;
      const redirectUri = process.env.NEXT_PUBLIC_AWS_COGNITO_REDIRECT_URI;

      if (!clientId || !domain || !redirectUri) {
        throw new Error("Missing Cognito configuration");
      }

      // Generate PKCE values
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateCodeVerifier().substring(0, 16); // Shorter state

      // Store code_verifier for callback
      storeCodeVerifier(state, codeVerifier);

      // Build Cognito authorization URL
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email profile",
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        identity_provider: "Google",
        prompt: "select_account", // Force account selection screen
      });

      const authUrl = `https://${domain}/oauth2/authorize?${params.toString()}`;
      
      // Redirect to Cognito
      window.location.href = authUrl;
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

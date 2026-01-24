// PKCE utilities for OAuth flow
// Used to manually handle OAuth with Cognito when Amplify's signInWithRedirect has issues

// Generate a random string for code_verifier
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Generate code_challenge from code_verifier using SHA256
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Store code_verifier in sessionStorage (keyed by state)
export function storeCodeVerifier(state: string, verifier: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`oauth_pkce_${state}`, verifier);
  }
}

// Retrieve code_verifier from sessionStorage
export function getCodeVerifier(state: string): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(`oauth_pkce_${state}`);
  }
  return null;
}

// Remove code_verifier after use
export function clearCodeVerifier(state: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`oauth_pkce_${state}`);
  }
}

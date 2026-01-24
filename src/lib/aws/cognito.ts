// Server-side Cognito utilities using Amplify
// For server-side operations, we still use AWS SDK directly
// Client-side operations use Amplify

import { User } from "@/types/auth";

// Decode JWT token to get user info (server-side utility)
export function decodeIdToken(idToken: string): any {
  try {
    const payload = idToken.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString());
    return decoded;
  } catch (error) {
    console.error("Error decoding ID token:", error);
    return null;
  }
}

// Get user info from ID token (used in API routes)
export function getUserFromIdToken(idToken: string): User {
  const decoded = decodeIdToken(idToken);
  if (!decoded) {
    throw new Error("Invalid ID token");
  }

  // Extract provider from token
  let provider: "google" | "email" = "email";
  if (decoded.identities && decoded.identities.length > 0) {
    const identity = decoded.identities[0];
    if (identity.providerName === "Google" || identity.providerType === "Google") {
      provider = "google";
    }
  }

  return {
    id: decoded.sub,
    email: decoded.email || "",
    name: decoded.name || decoded["cognito:username"] || undefined,
    photoURL: decoded.picture || decoded["custom:picture"] || undefined,
    provider,
    createdAt: decoded.iat ? new Date(decoded.iat * 1000) : new Date(),
    updatedAt: new Date(),
  };
}

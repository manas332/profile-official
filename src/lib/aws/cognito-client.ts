// Client-side Cognito utilities using AWS Amplify
"use client";

import { signIn, signOut, signUp, getCurrentUser, fetchAuthSession, signInWithRedirect } from "aws-amplify/auth";
import { User } from "@/types/auth";

// Convert Amplify user to our User type
export function convertAmplifyUserToUser(amplifyUser: any, provider: "google" | "email" = "email"): User {
  const attributes = amplifyUser.signInUserSession?.idToken?.payload || {};
  
  return {
    id: attributes.sub || amplifyUser.username || "",
    email: attributes.email || "",
    name: attributes.name || attributes["cognito:username"] || undefined,
    photoURL: attributes.picture || undefined,
    provider,
    createdAt: attributes.iat ? new Date(attributes.iat * 1000) : new Date(),
    updatedAt: new Date(),
  };
}

// Sign up with email and password (client-side)
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ userId: string; email: string; requiresConfirmation: boolean }> {
  try {
    const userAttributes: Record<string, string> = {
      email,
    };

    if (name) {
      userAttributes.name = name;
    }

    const { userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes,
      },
    });

    return {
      userId,
      email,
      requiresConfirmation: nextStep.signUpStep === "CONFIRM_SIGN_UP",
    };
  } catch (error: any) {
    console.error("Error signing up with Amplify:", error);
    if (error.name === "UsernameExistsException") {
      throw new Error("Email already in use");
    }
    if (error.name === "InvalidPasswordException") {
      throw new Error("Password does not meet requirements");
    }
    if (error.name === "InvalidParameterException") {
      throw new Error("Invalid email or password format");
    }
    throw new Error(error.message || "Failed to sign up");
  }
}

// Sign in with email and password (client-side)
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ userId: string; idToken: string; accessToken: string }> {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password,
    });

    if (!isSignedIn) {
      throw new Error("Sign in failed");
    }

    // Get tokens
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString() || "";
    const accessToken = session.tokens?.accessToken?.toString() || "";

    if (!idToken) {
      throw new Error("Failed to get ID token");
    }

    // Get user ID from token
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
    const userId = payload.sub;

    return {
      userId,
      idToken,
      accessToken,
    };
  } catch (error: any) {
    console.error("Error signing in with Amplify:", error);
    if (error.name === "NotAuthorizedException") {
      throw new Error("Invalid email or password");
    }
    if (error.name === "UserNotConfirmedException") {
      throw new Error("User email not confirmed. Please verify your email.");
    }
    if (error.name === "UserNotFoundException") {
      throw new Error("User not found");
    }
    throw new Error(error.message || "Failed to sign in");
  }
}

// Get current user (client-side)
export async function getCurrentUserClient(): Promise<User | null> {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();

    if (!idToken) {
      return null;
    }

    // Decode token to get user info
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
    
    // Determine provider
    let provider: "google" | "email" = "email";
    if (payload.identities && payload.identities.length > 0) {
      const identity = payload.identities[0];
      if (identity.providerName === "Google" || identity.providerType === "Google") {
        provider = "google";
      }
    }

    return {
      id: payload.sub,
      email: payload.email || "",
      name: payload.name || payload["cognito:username"] || undefined,
      photoURL: payload.picture || undefined,
      provider,
      createdAt: payload.iat ? new Date(payload.iat * 1000) : new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Sign out (client-side)
export async function signOutClient(): Promise<void> {
  try {
    await signOut();
  } catch (error: any) {
    console.error("Error signing out:", error);
    // Don't throw - sign out is best effort
  }
}

// Initiate Google sign-in using Amplify
export async function initiateGoogleSignIn(): Promise<void> {
  try {
    await signInWithRedirect({ provider: "Google" });
  } catch (error: any) {
    console.error("Error initiating Google sign-in:", error);
    throw error;
  }
}

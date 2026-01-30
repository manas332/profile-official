"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import { User } from "@/types/auth";

export function useAuth() {
  const { user, authStatus } = useAuthenticator((context) => [
    context.user,
    context.authStatus,
  ]);

  const handleSignOut = async () => {
    try {
      // Sign out from Amplify
      await signOut();
      // Also clear server session
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      // Still try to clear server session and redirect
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      window.location.href = "/login";
    }
  };

  // Map Amplify user to your User type
  const mappedUser: User | null = user
    ? {
        id: user.userId,
        email: user.signInDetails?.loginId || "",
        name: user.username || "",
        provider: "email",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : null;

  return {
    user: mappedUser,
    loading: authStatus === "configuring",
    isAuthenticated: authStatus === "authenticated",
    signOut: handleSignOut,
  };
}

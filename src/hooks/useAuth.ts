"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { getSessionClient } from "@/lib/auth/session";
import { signOut as firebaseSignOut } from "@/lib/firebase/auth";
import { deleteSession } from "@/lib/auth/session";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSessionClient();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut();
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
}

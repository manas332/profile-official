"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { signOut as firebaseSignOut } from "@/lib/firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          // Response is not JSON, treat as unauthenticated
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
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

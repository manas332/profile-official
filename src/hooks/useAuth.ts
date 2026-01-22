"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { getCurrentUserClient, signOutClient } from "@/lib/aws/cognito-client";
import { fetchAuthSession } from "aws-amplify/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // First try to get user from Amplify
        const amplifyUser = await getCurrentUserClient();
        
        if (amplifyUser) {
          // If Amplify has user, sync with server session
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          if (idToken) {
            // Send token to server to create/update session
            try {
              const response = await fetch("/api/auth/session", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
              });
              
              const data = await response.json();
              if (data.authenticated && data.user) {
                setUser(data.user);
              } else {
                setUser(amplifyUser);
              }
            } catch {
              // If server sync fails, use Amplify user
              setUser(amplifyUser);
            }
          } else {
            setUser(amplifyUser);
          }
        } else {
          // Fallback to server session check
          const response = await fetch("/api/auth/session");
          const data = await response.json();
          
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        // Fallback to server session
        try {
          const response = await fetch("/api/auth/session");
          const data = await response.json();
          setUser(data.authenticated && data.user ? data.user : null);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signOut = async () => {
    try {
      // Sign out from Amplify
      await signOutClient();
      // Also sign out from server session
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      // Still try to clear server session
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}
      setUser(null);
      window.location.href = "/login";
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
}

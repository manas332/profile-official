"use client";

import { useState, useEffect } from "react";
import { SessionData } from "@/lib/auth/session";

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setSession({
            user: data.user,
            token: "", // Token is not exposed to client for security
            expiresAt: data.expiresAt || 0,
          });
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session,
  };
}

"use client";

import { useState, useEffect } from "react";
import { SessionData } from "@/lib/auth/session";
import { getSessionClient } from "@/lib/auth/session";

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = getSessionClient();
    setSession(sessionData);
    setLoading(false);
  }, []);

  return {
    session,
    loading,
    isAuthenticated: !!session,
  };
}

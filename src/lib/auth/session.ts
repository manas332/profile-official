import { cookies } from "next/headers";
import { User } from "@/types/auth";

const SESSION_COOKIE_NAME = "astro_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  user: User;
  token: string;
  expiresAt: number;
}

export async function createSession(user: User, token: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const sessionData: SessionData = {
    user,
    token,
    expiresAt,
  };
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const sessionData: SessionData = JSON.parse(sessionCookie.value);
    
    if (sessionData.expiresAt < Date.now()) {
      await deleteSession();
      return null;
    }
    
    return sessionData;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getSessionClient(): SessionData | null {
  if (typeof window === "undefined") {
    return null;
  }
  
  const cookies = document.cookie.split("; ");
  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const value = sessionCookie.split("=")[1];
    const sessionData: SessionData = JSON.parse(decodeURIComponent(value));
    
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }
    
    return sessionData;
  } catch {
    return null;
  }
}

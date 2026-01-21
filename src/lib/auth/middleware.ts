import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./session";

export async function requireAuth(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  
  return null;
}

export async function requireGuest(request: NextRequest) {
  const session = await getSession();
  
  if (session) {
    const url = request.nextUrl.clone();
    url.pathname = "/astro";
    return NextResponse.redirect(url);
  }
  
  return null;
}

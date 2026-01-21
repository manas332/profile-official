import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";
import { signOut } from "@/lib/firebase/auth";

export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    
    // Note: Firebase signOut should be called client-side
    // This is just for server-side session cleanup
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

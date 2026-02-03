"use server";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "valid_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

export async function verifyAdminPassword(password: string): Promise<{ success: boolean; message?: string }> {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        console.error("ADMIN_PASSWORD is not set in environment variables");
        return { success: false, message: "Server configuration error. Please contact developer." };
    }

    if (password === adminPassword) {
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/admin", // Scope to admin route
        });
        return { success: true };
    }

    return { success: false, message: "Invalid password" };
}

export async function checkAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME);
    return session?.value === "true";
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
}

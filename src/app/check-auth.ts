"use server";

import { getSession } from "@/lib/auth/session";

export async function checkUserDomain(): Promise<boolean> {
    const session = await getSession();
    if (session && session.user && session.user.email) {
        return session.user.email.endsWith("@humarapandit.com");
    }
    return false;
}

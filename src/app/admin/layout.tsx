import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    // 1. Check if user is logged in
    if (!session || !session.user) {
        redirect("/login");
    }

    // 2. Check email domain
    const email = session.user.email;
    if (!email || !email.endsWith("@humarapandit.com")) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-amber-50">
            {children}
        </div>
    );
}

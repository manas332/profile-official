import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import React from "react";

export default async function ConsultationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login?redirect=/consultation");
    }

    return (
        <>
            {children}
        </>
    );
}

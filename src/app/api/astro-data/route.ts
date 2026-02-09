import { NextResponse } from "next/server";
import { getAstroData } from "@/lib/aws/astro";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const data = await getAstroData();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching astro data:", error);
        return NextResponse.json(
            { error: "Failed to fetch astro data" },
            { status: 500 }
        );
    }
}

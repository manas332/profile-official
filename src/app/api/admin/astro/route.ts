import { NextRequest, NextResponse } from "next/server";
import { getAstroData, updateAstroData, seedAstroData } from "@/lib/aws/astro";

export async function GET() {
    try {
        // Attempt to seed on every GET to ensure data exists if table was just created
        // This is a simple way to "for one time push default data" without running a separate script
        await seedAstroData();

        const data = await getAstroData();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.name || !body.description) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Ensure we keep the ID as default
        const dataToUpdate = {
            ...body,
            id: "default",
        };

        await updateAstroData(dataToUpdate);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

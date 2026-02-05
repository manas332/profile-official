'use server';

import { getAstroData, updateAstroData, AstroData } from "@/lib/aws/astro";
import { revalidatePath } from "next/cache";

export async function fetchAstroData() {
    try {
        const data = await getAstroData();
        console.log("Admin Action Fetch - Data:", JSON.stringify(data, null, 2));
        return { success: true, data };
    } catch (error: any) {
        console.error("Error fetching astro data:", error);
        return { success: false, error: error.message };
    }
}

export async function saveAstroData(data: AstroData) {
    try {
        console.log("Admin Action Save - Data:", JSON.stringify(data, null, 2));
        await updateAstroData(data);
        revalidatePath("/astro");
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Error saving astro data:", error);
        return { success: false, error: error.message };
    }
}

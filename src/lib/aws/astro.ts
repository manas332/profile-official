import {
    PutCommand,
    GetCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDocClient } from "./config";

const ASTRO_TABLE = process.env.APP_AWS_DYNAMODB_ASTRO_TABLE || "astro_data";

export interface ConsultationPackage {
    title: string;
    price: string;
    duration: string;
    description: string;
    features: string[];
    popular?: boolean;
    link?: string;
    imageUrl?: string;
}

export interface AstroData {
    id: string; // "default" for now
    name: string;
    photoUrl: string;
    description: string;
    packages: ConsultationPackage[];
    quotes: string[];
    updatedAt: string;
}

const DEFAULT_ASTRO_DATA: AstroData = {
    id: "default",
    name: "Pandit Sharma",
    photoUrl: "/astro-img.jpg",
    description: `With over 15 years of dedicated practice in Vedic Astrology, Pandit Sharma has helped thousands of individuals navigate life's challenges and opportunities. His deep understanding of planetary positions, birth charts, and cosmic energies enables him to provide accurate predictions and practical remedies.

Specializing in personalized Kundli readings, he offers insights into career progression, relationship compatibility, health concerns, and spiritual development. His approach combines traditional Vedic wisdom with contemporary understanding, making ancient knowledge accessible and applicable to modern life.`,
    packages: [
        {
            title: "Quick Session",
            price: "₹999",
            duration: "15 Minutes",
            description: "Ideal for 1 quick question and direction.",
            features: ["Quick Question", "Basic Guidance"],
            link: "",
        },
        {
            title: "Standard Session",
            price: "₹1,999",
            duration: "30 Minutes",
            description: "Detailed guidance with kundli-based insights.",
            features: ["Detailed Analysis", "Kundli Reading", "Remedy Suggestions"],
            popular: true,
            link: "",
        },
        {
            title: "Premium Session",
            price: "₹3,499",
            duration: "60 Minutes",
            description: "Complete, in-depth analysis with remedies.",
            features: ["Complete Kundli Analysis", "Gemstone Consultation", "Detailed Remedies"],
            link: "",
        },
    ],
    quotes: [
        "The stars incline, they do not compel. Wisdom lies in understanding their guidance.",
        "Astrology is a language. If you understand this language, the sky speaks to you.",
        "Your path is illuminated by the light of the stars, but you must walk it yourself.",
    ],
    updatedAt: new Date().toISOString(),
};

export async function getAstroData(id: string = "default"): Promise<AstroData> {
    try {
        const result = await dynamoDocClient.send(
            new GetCommand({
                TableName: ASTRO_TABLE,
                Key: { id },
            })
        );

        if (result.Item) {
            return result.Item as AstroData;
        }

        // If no data exists, return default data but don't save it yet unless explicitly requested.
        // However, to ensure smooth frontend experience, we might want to seed it if it's missing.
        // For now, let's just return the default object structure.
        return DEFAULT_ASTRO_DATA;
    } catch (error: any) {
        console.error("Error getting astro data:", error);
        // If table doesn't exist, return default data so the app doesn't crash
        if (error.name === "ResourceNotFoundException") {
            console.warn("Astro table not found, returning default data.");
            return DEFAULT_ASTRO_DATA;
        }
        throw error;
    }
}

export async function updateAstroData(data: AstroData): Promise<void> {
    try {
        await dynamoDocClient.send(
            new PutCommand({
                TableName: ASTRO_TABLE,
                Item: {
                    ...data,
                    updatedAt: new Date().toISOString(),
                },
            })
        );
    } catch (error: any) {
        console.error("Error updating astro data:", error);
        if (error.name === "ResourceNotFoundException") {
            throw new Error(
                `DynamoDB table "${ASTRO_TABLE}" not found. Please create it in AWS Console with partition key 'id' (String).`
            );
        }
        throw error;
    }
}

export async function seedAstroData(): Promise<void> {
    try {
        const existing = await getAstroData("default");
        // We check if it's actually in DB or just our fallback.
        // To do this confidently, let's actually try to fetch from DB without fallback logic.
        const result = await dynamoDocClient.send(
            new GetCommand({
                TableName: ASTRO_TABLE,
                Key: { id: "default" },
            })
        );

        if (!result.Item) {
            console.log("Seeding initial AstroData...");
            await updateAstroData(DEFAULT_ASTRO_DATA);
        } else {
            console.log("AstroData already exists, skipping seed.");
        }

    } catch (error) {
        console.error("Error during seeding:", error);
        // Likely table doesn't exist
    }
}

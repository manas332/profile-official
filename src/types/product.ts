export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;

    // New Fields for Mystical/Indian Context
    benefits?: string[];
    zodiac?: string[];   // Western Zodiac (e.g., Leo)
    rashi?: string[];    // Indian Rashi (e.g., Mesh)
    chakra?: string;     // e.g., Root Chakra
    planet?: string;     // e.g., Saturn (Shani)
    element?: string;    // e.g., Fire
    ritual?: string;     // Vidhi (How to wear)
    isEnergized?: boolean; // Pran Pratishtha status
    certification?: string; // Lab Certificate URL or Text
}

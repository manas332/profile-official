"use client";

import { v4 as uuidv4 } from 'uuid';

export interface ConsultationPackage {
    id: string;
    title: string;
    price: number;
    description: string;
    features: string[]; // comma separated string stored as array
    imageUrl?: string;
    link?: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    link?: string;
    createdAt: string;
}

const PACKAGES_KEY = 'admin_packages';
const PRODUCTS_KEY = 'admin_products';

const defaultPackages: ConsultationPackage[] = [
    {
        id: "pkg-1",
        title: "Quick Session",
        price: 999,
        description: "Ideal for 1 quick question and direction.",
        features: ["Quick Question", "Basic Guidance"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "pkg-2",
        title: "Standard Session",
        price: 1999,
        description: "Detailed guidance with kundli-based insights.",
        features: ["Detailed Analysis", "Kundli Reading", "Remedy Suggestions"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "pkg-3",
        title: "Premium Session",
        price: 3499,
        description: "Complete, in-depth analysis with remedies.",
        features: ["Complete Kundli Analysis", "Gemstone Consultation", "Detailed Remedies"],
        createdAt: new Date().toISOString(),
    },
];

const defaultProducts: Product[] = [
    {
        id: "prod-1",
        name: "Ruby (Manik)",
        description: "Sun Stone",
        category: "Gemstone",
        price: 24999,
        imageUrl: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=500&auto=format",
        createdAt: new Date().toISOString(),
    },
    {
        id: "prod-2",
        name: "Blue Sapphire",
        description: "Saturn Stone",
        category: "Gemstone",
        price: 34999,
        imageUrl: "https://images.unsplash.com/photo-1610735052189-2bdb7d092643?q=80&w=500&auto=format",
        createdAt: new Date().toISOString(),
    },
    {
        id: "prod-3",
        name: "Yellow Sapphire",
        description: "Jupiter Stone",
        category: "Gemstone",
        price: 29999,
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=500&auto=format",
        createdAt: new Date().toISOString(),
    },
    {
        id: "prod-4",
        name: "Emerald",
        description: "Mercury Stone",
        category: "Gemstone",
        price: 22999,
        imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=500&auto=format",
        createdAt: new Date().toISOString(),
    },
];

export const adminStore = {
    // Packages
    getPackages: (): ConsultationPackage[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(PACKAGES_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize if empty
            localStorage.setItem(PACKAGES_KEY, JSON.stringify(defaultPackages));
            return defaultPackages;
        } catch (e) {
            console.error('Failed to parse packages', e);
            return [];
        }
    },

    addPackage: (pkg: Omit<ConsultationPackage, 'id' | 'createdAt'>): ConsultationPackage => {
        const packages = adminStore.getPackages();
        const newPackage: ConsultationPackage = {
            ...pkg,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem(PACKAGES_KEY, JSON.stringify([...packages, newPackage]));
        return newPackage;
    },

    deletePackage: (id: string) => {
        const packages = adminStore.getPackages();
        const filtered = packages.filter(p => p.id !== id);
        localStorage.setItem(PACKAGES_KEY, JSON.stringify(filtered));
    },

    // Products
    getProducts: (): Product[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(PRODUCTS_KEY);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize if empty
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
            return defaultProducts;
        } catch (e) {
            console.error('Failed to parse products', e);
            return [];
        }
    },

    addProduct: (product: Omit<Product, 'id' | 'createdAt'>): Product => {
        const products = adminStore.getProducts();
        const newProduct: Product = {
            ...product,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([...products, newProduct]));
        return newProduct;
    },

    deleteProduct: (id: string) => {
        const products = adminStore.getProducts();
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
    }
};

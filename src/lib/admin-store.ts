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
    }
};

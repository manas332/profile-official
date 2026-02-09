"use client";

import Header from "@/components/astro/Header";
import Footer from "@/components/astro/Footer";
import { motion } from "framer-motion";
import { Sparkles, Phone, MapPin, Heart, Star, Users, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface AstroData {
    aboutContent: string;
}

export default function AboutPage() {
    const [aboutContent, setAboutContent] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/astro-data");
                if (res.ok) {
                    const data: AstroData = await res.json();
                    setAboutContent(data.aboutContent || "");
                }
            } catch (error) {
                console.error("Failed to fetch about content:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Simple markdown-like parsing for headers and bold text
    const renderContent = (content: string) => {
        const lines = content.split("\n");
        return lines.map((line, idx) => {
            if (line.startsWith("# ")) {
                return (
                    <h1 key={idx} className="text-3xl md:text-4xl font-bold text-amber-900 mb-6 mt-8 first:mt-0">
                        {line.replace("# ", "")}
                    </h1>
                );
            }
            if (line.startsWith("## ")) {
                return (
                    <h2 key={idx} className="text-2xl font-semibold text-amber-800 mb-4 mt-8">
                        {line.replace("## ", "")}
                    </h2>
                );
            }
            if (line.trim() === "") {
                return <div key={idx} className="h-4" />;
            }
            // Handle bold text with **text**
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
                <p key={idx} className="text-gray-700 leading-relaxed mb-3">
                    {parts.map((part, pIdx) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                                <strong key={pIdx} className="text-amber-700 font-semibold">
                                    {part.slice(2, -2)}
                                </strong>
                            );
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
            <Header />

            {/* Hero Section */}
            <section className="relative py-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-orange-100/50" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative max-w-4xl mx-auto text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Bridging Spirituality & Technology
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        About <span className="text-amber-600">Humara Pandit</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your trusted partner in spiritual guidance, connecting you to ancient wisdom through modern convenience.
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6">
                    {[
                        { icon: Star, label: "Certified Astrologers", value: "Expert Guidance" },
                        { icon: Users, label: "Happy Customers", value: "1000+" },
                        { icon: Heart, label: "Sacred Products", value: "100% Authentic" },
                        { icon: ShieldCheck, label: "Secure Platform", value: "Trusted" },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100 text-center"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-amber-100"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                        </div>
                    ) : aboutContent ? (
                        <div className="prose prose-lg max-w-none">
                            {renderContent(aboutContent)}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-10">About content not available.</p>
                    )}
                </motion.div>
            </section>

            {/* Contact Section */}
            <section className="py-16 px-6 bg-gradient-to-r from-amber-600 to-orange-500">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                    <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                        Have questions or need guidance? We're here to help you on your spiritual journey.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>Bengaluru, India</span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

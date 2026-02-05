"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            <div className="max-w-3xl w-full text-center space-y-12 relative z-10">
                {/* 404 Visual */}
                <div className="relative inline-block">
                    <motion.h1
                        className="text-[12rem] sm:text-[18rem] font-black leading-none text-slate-100 select-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        404
                    </motion.h1>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 transform -rotate-3">
                            <Search className="w-16 h-16 text-blue-600 mb-2 mx-auto" />
                            <p className="text-slate-900 font-bold text-xl uppercase tracking-tighter italic">Lost in the Cosmos?</p>
                        </div>
                    </motion.div>
                </div>

                {/* Message Section */}
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase">Path Not Found</h2>
                    <p className="text-xl text-slate-600 max-w-lg mx-auto font-medium">
                        Even the stars sometimes align in mysterious ways. It seems the spiritual path you're looking for has shifted.
                    </p>
                </motion.div>

                {/* CTAs */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <Link
                        href="/"
                        className="w-full sm:w-auto py-4 px-8 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                        <Home className="w-5 h-5" />
                        <span>Back to Earth</span>
                    </Link>
                    <Link
                        href="/products"
                        className="w-full sm:w-auto py-4 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Sacred Collection</span>
                    </Link>
                </motion.div>

                {/* Bottom spiritual note */}
                <motion.p
                    className="text-slate-400 font-bold text-sm uppercase tracking-widest pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                >
                    🕉️ Namaste
                </motion.p>
            </div>
        </div>
    );
}

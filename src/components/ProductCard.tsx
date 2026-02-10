"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import { ShoppingBag, Star, Check } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart()

    const [isAdded, setIsAdded] = React.useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <Link href={`/astro/products/${product.id}`} className="block group">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-amber-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-300 relative">
                {/* Image Container - Aspect 1:1 */}
                <div className="relative aspect-square overflow-hidden bg-amber-50/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-all duration-300 ${isAdded
                            ? "bg-green-500 text-white translate-y-0 opacity-100 scale-110"
                            : "bg-white text-amber-600 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-amber-600 hover:text-white"
                            }`}
                        title="Add to Cart"
                    >
                        {isAdded ? <Check size={20} /> : <ShoppingBag size={20} />}
                    </button>

                    {/* Energized Badge */}
                    {product.isEnergized && (
                        <div className="absolute top-3 left-3 bg-amber-100/90 backdrop-blur-sm text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                            <Star size={10} fill="currentColor" /> <span>Energized</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="text-slate-800 font-serif font-medium text-lg leading-tight group-hover:text-amber-700 transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    {/* Tags (Benefits/Zodiac) */}
                    <div className="flex flex-wrap gap-1 h-5 overflow-hidden">
                        {product.benefits && product.benefits.slice(0, 2).map((benefit, i) => (
                            <span key={i} className="text-[10px] uppercase tracking-wider text-amber-600/80 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                {benefit}
                            </span>
                        ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-amber-50 mt-2">
                        <p className="text-xl font-bold text-slate-900">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                        <span className="text-xs text-slate-400 font-medium">
                            {product.category}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

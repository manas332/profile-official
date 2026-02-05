import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/products/${product.id}`} className="block group">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                {/* Image Container - Aspect 1:1 */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                    <h3 className="text-slate-900 font-medium text-base sm:text-lg truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                        <p className="text-lg sm:text-xl font-bold text-slate-900 border-l-2 border-blue-600 pl-2">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                        <span className="self-start sm:self-auto text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded">
                            {product.category || 'Spiritual'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

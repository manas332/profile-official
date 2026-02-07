"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

interface ProductActionsProps {
    product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    const handleIncrement = () => setQuantity((prev) => prev + 1);
    const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset state
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        router.push("/checkout"); // or /cart then checkout
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <span className="text-amber-900 font-medium">Quantity:</span>
                <div className="flex items-center border border-amber-200 rounded-lg bg-amber-50">
                    <button
                        onClick={handleDecrement}
                        className="p-3 text-amber-700 hover:bg-amber-100 rounded-l-lg transition-colors"
                        disabled={quantity <= 1}
                    >
                        <Minus size={18} />
                    </button>
                    <span className="px-4 text-lg font-semibold text-amber-900 w-12 text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={handleIncrement}
                        className="p-3 text-amber-700 hover:bg-amber-100 rounded-r-lg transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 text-lg font-semibold shadow-lg transition-all ${isAdded
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-white text-amber-900 border-2 border-amber-900 hover:bg-amber-50"
                        }`}
                >
                    <ShoppingBag className="mr-2 w-5 h-5" />
                    {isAdded ? "Added to Cart" : "Add to Cart"}
                </Button>

                <Button
                    onClick={handleBuyNow}
                    className="flex-1 py-4 text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-xl hover:shadow-amber-200/50 hover:scale-[1.02] transition-transform border-none"
                >
                    <Zap className="mr-2 w-5 h-5 fill-current" />
                    Buy Now
                </Button>
            </div>

            <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
                <span>🔒</span> Secure Payment with Razorpay/UPI
            </p>
        </div>
    );
}

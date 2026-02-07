"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

export default function CartIcon() {
    const { cartCount } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Link href="/cart" className="relative p-2 text-slate-600 hover:text-amber-600 transition-colors group">
            <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                    {cartCount}
                </span>
            )}
        </Link>
    );
}

"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} />
                </div>
                <h1 className="text-3xl font-serif text-slate-900 mb-2">Your Cart is Empty</h1>
                <p className="text-slate-500 mb-8 text-center max-w-sm">
                    Your sacred journey begins with a single step. Explore our collection to find your spiritual companion.
                </p>
                <Link href="/products">
                    <Button className="px-8 py-3 bg-amber-600 text-white hover:bg-amber-700">
                        Explore Collection
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-serif text-slate-900 mb-8 flex items-center gap-3">
                    <ShoppingBag className="text-amber-600" />
                    Your Sacred Cart
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-100 flex gap-4 sm:gap-6 items-center">
                                {/* Image */}
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-slate-900 sm:text-lg truncate">{item.name}</h3>
                                    <p className="text-sm text-slate-500 mb-2 capitalize">{item.category}</p>
                                    <p className="font-bold text-slate-900">₹{Number(item.price).toLocaleString("en-IN")}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="p-1 sm:p-2 text-slate-600 hover:text-amber-600 disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="p-1 sm:p-2 text-slate-600 hover:text-amber-600"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-400 hover:text-red-600 p-1"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Energization (Pran Pratishtha)</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mb-8">
                                <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Inclusive of all taxes</p>
                            </div>

                            <Link href="/checkout" className="block w-full">
                                <Button className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2">
                                    Proceed to Checkout
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>

                            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 justify-center">
                                <ShieldCheck size={14} className="text-green-500" />
                                <span>Secure Checkout verified by Razorpay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

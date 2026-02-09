"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                <CheckCircle size={40} />
            </div>
            <div>
                <h2 className="text-3xl font-serif text-slate-900 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-500">
                    We'll reach you out shortly.
                </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-left space-y-2">
                <div className="flex justify-between">
                    <span className="text-slate-500">Booking ID:</span>
                    <span className="font-mono font-bold text-slate-900">#{orderId || "PENDING"}</span>
                </div>
                {paymentId && (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Payment ID:</span>
                        <span className="font-mono font-bold text-slate-900">{paymentId}</span>
                    </div>
                )}
            </div>
            <Link href="/" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3">
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}

export default function ConsultationThankYouPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ThankYouContent />
            </Suspense>
        </div>
    );
}

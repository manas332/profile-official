"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadRazorpayScript } from "@/lib/utils/razorpay-client";

interface ConsultationFormProps {
    name: string;
    email: string;
    phone: string;
    packageId: string;
    date: string;
    time: string;
}

const PACKAGES = [
    { id: "30min", title: "30 Minutes Session", price: 1100 },
    { id: "60min", title: "60 Minutes Session", price: 2100 },
];

export default function ConsultationPage() {
    const router = useRouter();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ConsultationFormProps>();
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedPackageId = watch("packageId");
    const selectedPackage = PACKAGES.find(p => p.id === selectedPackageId);

    const onSubmit = async (data: ConsultationFormProps) => {
        setIsProcessing(true);
        const amount = selectedPackage ? selectedPackage.price : 0;

        if (amount === 0) {
            alert("Please select a valid package");
            setIsProcessing(false);
            return;
        }

        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Failed to load payment gateway.");
                setIsProcessing(false);
                return;
            }

            // Create Order
            const response = await fetch("/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: amount,
                    currency: "INR",
                    type: "consultation",
                    items: [{
                        name: selectedPackage?.title,
                        price: amount,
                        quantity: 1,
                        id: selectedPackage?.id
                    }],
                    consultationDetails: {
                        date: data.date,
                        time: data.time,
                        packageId: data.packageId
                    },
                    userEmail: data.email,
                    userPhone: data.phone,
                    userName: data.name,
                    astroId: "default"
                }),
            });

            const resData = await response.json();

            if (!resData.success) {
                alert(resData.error || "Failed to create order");
                setIsProcessing(false);
                return;
            }

            const options = {
                key: resData.keyId,
                amount: resData.amount,
                currency: resData.currency,
                name: "Humara Pandit",
                description: "Consultation Booking",
                order_id: resData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                dbOrderId: resData.dbOrderId,
                                type: "consultation"
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            router.push(`/consultation/thank-you?orderId=${resData.dbOrderId}&paymentId=${response.razorpay_payment_id}`);
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (error) {
                        console.error("Verification Error:", error);
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: data.name,
                    email: data.email,
                    contact: data.phone,
                },
                theme: {
                    color: "#d97706",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
            setIsProcessing(false);

        } catch (error) {
            console.error("Booking Error:", error);
            alert("Something went wrong.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-slate-900 p-6 text-center">
                    <h1 className="text-3xl font-serif text-white">Book Your Consultation</h1>
                    <p className="text-slate-400 mt-2">Schedule a session with our expert astrologers</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Personal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-black">Full Name <span className="text-red-500">*</span></Label>
                                <Input {...register("name", { required: true })} placeholder="Your Name" className="bg-slate-50" />
                                {errors.name && <span className="text-red-500 text-xs">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-black">Phone Number <span className="text-red-500">*</span></Label>
                                <Input {...register("phone", { required: true, pattern: /^[0-9]{10}$/ })} placeholder="10-digit number" className="bg-slate-50" />
                                {errors.phone && <span className="text-red-500 text-xs">Valid phone required</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black">Email Address <span className="text-red-500">*</span></Label>
                            <Input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} placeholder="you@example.com" className="bg-slate-50" />
                            {errors.email && <span className="text-red-500 text-xs">Valid email required</span>}
                        </div>

                        {/* Package Selection */}
                        <div className="space-y-2">
                            <Label className="text-black">Select Package <span className="text-red-500">*</span></Label>
                            <select
                                {...register("packageId", { required: true })}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                            >
                                <option value="">-- Choose a Plan --</option>
                                {PACKAGES.map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.title} - ₹{pkg.price}</option>
                                ))}
                            </select>
                            {errors.packageId && <span className="text-red-500 text-xs">Please select a package</span>}
                        </div>

                        {/* Date and Time Preference (Placeholder for now) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-black">Preferred Date</Label>
                                <Input type="date" {...register("date", { required: true })} className="bg-slate-50" />
                                {errors.date && <span className="text-red-500 text-xs">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-black">Preferred Time</Label>
                                <Input type="time" {...register("time", { required: true })} className="bg-slate-50" />
                                {errors.time && <span className="text-red-500 text-xs">Required</span>}
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg shadow-lg"
                            >
                                {isProcessing ? "Processing..." : selectedPackage ? `Pay ₹${selectedPackage.price}` : "Proceed into Payment"}
                            </Button>
                        </div>
                    </form>
                    <div className="mt-4 text-center">
                        <Link href="/" className="text-sm text-slate-500 hover:text-amber-600">Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

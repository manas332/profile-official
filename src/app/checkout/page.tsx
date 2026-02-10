"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, CreditCard, Wallet, Truck } from "lucide-react";
import Link from "next/link";
import { loadRazorpayScript } from "@/lib/utils/razorpay-client";

interface CheckoutFormProps {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    altPhone?: string;
    pincode: string;
    state: string;
    city: string;
    houseNumber: string;
    area: string;
    landmark?: string;
}

const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<CheckoutFormProps>();
    const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pincodeError, setPincodeError] = useState<string | null>(null);

    const pincodeValue = watch("pincode");

    // Pincode Lookup Logic
    useEffect(() => {
        if (pincodeValue && pincodeValue.length === 6) {
            const fetchPincodeDetails = async () => {
                setPincodeError(null);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${pincodeValue}`);
                    const data = await response.json();

                    if (data && data[0] && data[0].Status === "Success") {
                        const details = data[0].PostOffice[0];
                        setValue("city", details.District);
                        setValue("state", details.State);
                    } else {
                        setPincodeError("Invalid Pincode. Please enter manually.");
                    }
                } catch (error) {
                    console.error("Failed to fetch pincode details:", error);
                    setPincodeError("Could not fetch details. Please enter manually.");
                }
            };

            fetchPincodeDetails();
        }
    }, [pincodeValue, setValue]);

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-serif text-slate-900 mb-4">Your cart is empty</h1>
                <Link href="/products">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">Return to Shop</Button>
                </Link>
            </div>
        );
    }

    const onShippingSubmit = (data: CheckoutFormProps) => {
        setStep('payment');
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        if (paymentMethod === 'cod') {
            // Handle COD (Implementation pending/simulated)
            setTimeout(() => {
                setIsProcessing(false);
                clearCart();
                router.push('/checkout/thank-you?orderId=COD-' + Math.floor(Math.random() * 10000));
            }, 2000);
            return;
        }

        // Razorpay Flow
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Failed to load payment gateway. Please check your internet connection.");
                setIsProcessing(false);
                return;
            }

            const formData = getValues();

            // Create Order
            const response = await fetch("/api/razorpay/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: cartTotal,
                    currency: "INR",
                    type: "product",
                    items: cart,
                    shippingDetails: formData,
                    userEmail: formData.email,
                    userPhone: formData.phone,
                    userName: `${formData.firstName} ${formData.lastName}`,
                    astroId: "default" // Default astro for now
                }),
            });

            const data = await response.json();

            if (!data.success) {
                alert(data.error || "Something went wrong while creating order");
                setIsProcessing(false);
                return;
            }

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Humara Pandit",
                description: "Product Purchase",
                order_id: data.orderId,
                handler: async function (response: any) {
                    // Verify Payment
                    try {
                        const verifyRes = await fetch("/api/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                dbOrderId: data.dbOrderId,
                                type: "product"
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            clearCart();
                            router.push(`/checkout/thank-you?orderId=${data.dbOrderId}&paymentId=${response.razorpay_payment_id}`);
                        } else {
                            alert("Payment verification failed. Please contact support.");
                        }
                    } catch (error) {
                        console.error("Verification Error:", error);
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#d97706", // amber-600
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
            setIsProcessing(false); // Modal is open, we can stop processing state? Or keep it? keeping it false so button is clickable if they cancel. 
            // Better to keep processing true until modal closes? Razorpay doesn't give clean onDismiss in standard config easily without modal config.
            // But standard flow: user pays -> handler called.


        } catch (error) {
            console.error("Payment Error:", error);
            alert("Something went wrong with payment.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Form */}
                <div className="space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Link href="/cart" className="text-slate-400 hover:text-amber-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-3xl font-serif text-slate-900">Checkout</h1>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-4 text-sm font-medium mb-8">
                        <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-amber-600' : 'text-slate-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'shipping' ? 'bg-amber-100' : 'bg-slate-100'}`}>1</div>
                            <span>Shipping</span>
                        </div>
                        <div className="w-12 h-px bg-slate-200" />
                        <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-amber-600' : 'text-slate-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-amber-100' : 'bg-slate-100'}`}>2</div>
                            <span>Payment</span>
                        </div>
                    </div>

                    {step === 'shipping' ? (
                        <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-black mb-4">Shipping Information</h2>

                            {/* Name Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-black">First Name <span className="text-red-500">*</span></Label>
                                    <Input {...register('firstName', { required: true })} placeholder="First Name" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                    {errors.firstName && <span className="text-red-500 text-xs">Required</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-black">Last Name <span className="text-red-500">*</span></Label>
                                    <Input {...register('lastName', { required: true })} placeholder="Last Name" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                    {errors.lastName && <span className="text-red-500 text-xs">Required</span>}
                                </div>
                            </div>

                            {/* Contact Section */}
                            <div className="space-y-2">
                                <Label className="text-black">Email <span className="text-red-500">*</span></Label>
                                <Input type="email" {...register('email', { required: true })} placeholder="email@example.com" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                {errors.email && <span className="text-red-500 text-xs">Required</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-black">Phone <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="tel"
                                        {...register('phone', {
                                            required: true,
                                            pattern: { value: /^[6-9]\d{9}$/, message: "Invalid Phone Number" },
                                            maxLength: 10
                                        })}
                                        placeholder="9876543210"
                                        className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400"
                                    />
                                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message || "Required"}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-black">Alternate Phone <span className="text-slate-400 text-xs">(Optional)</span></Label>
                                    <Input
                                        type="tel"
                                        {...register('altPhone', {
                                            pattern: { value: /^[6-9]\d{9}$/, message: "Invalid Phone Number" },
                                            maxLength: 10
                                        })}
                                        placeholder="Alternate Number"
                                        className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400"
                                    />
                                    {errors.altPhone && <span className="text-red-500 text-xs">{errors.altPhone.message}</span>}
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">Address Details</h3>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <Label className="text-black">Pincode <span className="text-red-500">*</span></Label>
                                        <Input
                                            {...register('pincode', {
                                                required: true,
                                                pattern: { value: /^\d{6}$/, message: "Invalid Pincode" },
                                                maxLength: 6
                                            })}
                                            placeholder="110001"
                                            className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400"
                                        />
                                        {errors.pincode && <span className="text-red-500 text-xs">Required 6 digits</span>}
                                        {pincodeError && <span className="text-amber-600 text-xs">{pincodeError}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-black">City <span className="text-red-500">*</span></Label>
                                        <Input {...register('city', { required: true })} placeholder="City" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                        {errors.city && <span className="text-red-500 text-xs">Required</span>}
                                    </div>
                                </div>

                                <div className="mb-4 space-y-2">
                                    <Label className="text-black">State <span className="text-red-500">*</span></Label>
                                    <select
                                        {...register('state', { required: true })}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black"
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map((st) => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                    {errors.state && <span className="text-red-500 text-xs">Required</span>}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <Label className="text-black">Flat, House no., Building, Company, Apartment <span className="text-red-500">*</span></Label>
                                    <Input {...register('houseNumber', { required: true })} placeholder="" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                    {errors.houseNumber && <span className="text-red-500 text-xs">Required</span>}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <Label className="text-black">Area, Street, Sector, Village <span className="text-red-500">*</span></Label>
                                    <Input {...register('area', { required: true })} placeholder="" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                    {errors.area && <span className="text-red-500 text-xs">Required</span>}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <Label className="text-black">Landmark <span className="text-slate-400 text-xs">(Optional)</span></Label>
                                    <Input {...register('landmark')} placeholder="E.g. Near Apollo Hospital" className="bg-slate-50 border-slate-200 text-black placeholder:text-gray-400" />
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-lg">
                                Continue to Payment
                            </Button>
                        </form>
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Method</h2>

                            <div className="space-y-3">
                                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-4 flex items-center gap-3">
                                        <Truck className="text-slate-600" />
                                        <span className="font-semibold text-slate-900">Cash on Delivery (COD)</span>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={() => setPaymentMethod('razorpay')}
                                        className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="ml-4 flex items-center gap-3">
                                        <CreditCard className="text-slate-600" />
                                        <span className="font-semibold text-slate-900">Online Payment (Cards, UPI, NetBanking)</span>
                                    </div>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button
                                    onClick={() => setStep('shipping')}
                                    className="flex-1 py-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="flex-[2] py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 text-lg shadow-lg"
                                >
                                    {isProcessing ? 'Processing...' : `Pay ₹${cartTotal.toLocaleString("en-IN")}`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6">
                        <h3 className="font-serif text-lg font-bold text-slate-900">Your Order</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-slate-100 shrink-0 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        <p className="text-sm font-bold text-amber-700">₹{Number(item.price).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 pt-4 space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                                <span>Total</span>
                                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <div className="bg-amber-100/50 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                            <Wallet size={16} className="shrink-0 mt-0.5" />
                            <p>Complete your purchase to receive order confirmation and tracking details via email and SMS.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus, TABLE_NAMES } from "@/lib/aws/dynamodb";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            dbOrderId,
            type
        } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId || !type) {
            return NextResponse.json(
                { error: "Missing required verification parameters" },
                { status: 400 }
            );
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return NextResponse.json(
                { error: "Razorpay secret not configured" },
                { status: 500 }
            );
        }

        // Verify signature
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json(
                { error: "Invalid payment signature" },
                { status: 400 }
            );
        }

        // Update DB Order Status
        const tableName = type === 'consultation' ? TABLE_NAMES.CONSULTATION : TABLE_NAMES.PRODUCTS;

        await updateOrderStatus(tableName, dbOrderId, 'paid', {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully",
        });

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

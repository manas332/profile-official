import { NextRequest, NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { createOrder, TABLE_NAMES } from "@/lib/aws/dynamodb";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, currency = "INR", type, items, astroId, shippingDetails, consultationDetails, userId, userEmail, userName, userPhone } = body;

        if (!amount || !type) {
            return NextResponse.json(
                { error: "Amount and Type are required" },
                { status: 400 }
            );
        }

        // Determine table based on type
        const tableName = type === 'consultation' ? TABLE_NAMES.CONSULTATION : TABLE_NAMES.PRODUCTS;

        // Create Razorpay Order
        // Amount in subunits (paise for INR)
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${uuidv4().substring(0, 8)}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        if (!razorpayOrder) {
            return NextResponse.json(
                { error: "Failed to create Razorpay order" },
                { status: 500 }
            );
        }

        const dbOrderId = uuidv4();

        // Create DB Order
        await createOrder(tableName, {
            id: dbOrderId,
            userId,
            userName,
            userEmail,
            userPhone,
            amount,
            currency,
            items,
            status: 'created',
            razorpayOrderId: razorpayOrder.id as string,
            astroId: astroId || "default", // Use default if not provided
            type,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            shippingDetails,
            consultationDetails,
        });

        return NextResponse.json({
            success: true,
            orderId: razorpayOrder.id, // Razorpay Order ID
            dbOrderId: dbOrderId,      // Our DB Order ID
            amount: razorpayOrder.amount, // Amount in subunits
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error: any) {
        console.error("Error connecting to Razorpay or DynamoDB:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

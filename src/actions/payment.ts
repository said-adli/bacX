'use server';

import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface PaymentData {
    userId: string;
    userName: string;
    receiptUrl: string;
    amount: string;
    plan: string;
    status: 'pending';
}

export async function submitPayment(data: PaymentData) {
    try {
        // Validation could go here

        const paymentRef = db.collection('payments').doc();

        const batch = db.batch();

        batch.set(paymentRef, {
            ...data,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        const userRef = db.collection('users').doc(data.userId);
        batch.update(userRef, {
            subscriptionStatus: 'pending'
        });

        await batch.commit();

        return { success: true, paymentId: paymentRef.id };
    } catch (error: any) {
        console.error("Submit Payment Error:", error);
        throw new Error(error.message);
    }
}

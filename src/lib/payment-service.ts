import { submitPayment as submitPaymentAction } from "@/actions/payment";
import { approvePayment as approvePaymentAction, rejectPayment as rejectPaymentAction } from "@/actions/admin";

export interface PaymentRequest {
    userId: string;
    userName: string;
    receiptUrl: string;
    amount: string;
    plan: string; // 'monthly' | 'yearly'
    status: 'pending' | 'approved' | 'rejected';
}

export const submitPayment = async (data: PaymentRequest) => {
    // Map to the shape expected by Server Action if needed
    // The types match mostly.
    // Server action expects { ... status: 'pending' }

    // Server Action returns { success: true, paymentId: ... }
    const result = await submitPaymentAction({
        ...data,
        status: 'pending' // Ensure status is explicitly pending
    });

    return result.paymentId;
};

export const approvePayment = async (paymentId: string, userId: string) => {
    const result = await approvePaymentAction(paymentId, userId);
    if (!result.success) throw new Error(result.message);
    return result;
};

export const rejectPayment = async (paymentId: string, userId: string) => {
    const result = await rejectPaymentAction(paymentId, userId);
    if (!result.success) throw new Error(result.message);
    return result;
};

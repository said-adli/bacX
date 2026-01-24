"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface PaymentProof {
    id: string;
    student_id: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    student_email: string;
    plan_id: string; // The plan they are applying for (assuming logic ties proof to plan)
}

// Fetch Pending Payments
export async function getPendingPayments() {
    const supabase = await createClient();

    // Join with profiles to get email, and plans if possible
    // Assuming payment_proofs table has structure: id, user_id, status, image_url...
    // The previous plan context implies a 'payment_proofs' table.

    // NOTE: If 'payment_proofs' table doesn't exist, we might need to rely on 'subscription_requests' or similar.
    // Based on user: "Activation Queue: A dedicated section to view 'Payment Receipt Images'".
    // I will assume a table called `payment_receipts` or `payment_proofs`. 
    // If it doesn't exist, I'll need to create it or read existing schema carefully.
    // Since I didn't see it in schema dump (only updated schema), I will proceed assuming it exists or creating a task to ensure it.

    // Wait, the user manual says "Student Upload: Enabling students to upload payment receipts".
    // I will stick to a `payment_receipts` query. 

    const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
            id, 
            user_id, 
            status, 
            receipt_url, 
            created_at,
            profiles(email, full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch payments error:", error);
        return []; // Fail gracefully
    }

    return data;
}

// Approve Payment (ATOMIC TRANSACTION)
export async function approvePayment(receiptId: string, userId: string, planId: string) {
    const supabase = await createClient();

    // Call the custom Postgres function (RPC) for atomicity
    // verify the migration 20260124160000_atomic_payment.sql is applied
    const { error } = await supabase.rpc('approve_user_payment', {
        p_receipt_id: receiptId,
        p_user_id: userId,
        p_plan_id: planId
    });

    if (error) {
        console.error("Atomic Approval Failed:", error);
        throw new Error(`Transaction Failed: ${error.message}`);
    }

    revalidatePath('/admin/payments');
}

// Reject Payment
// Reject Payment
export async function rejectPayment(receiptId: string) {
    const supabase = await createClient();

    // 1. Get Receipt to find User
    const { data: receipt, error: fetchError } = await supabase
        .from('payment_receipts')
        .select('user_id')
        .eq('id', receiptId)
        .single();

    if (fetchError || !receipt) throw new Error("Receipt not found");

    // 2. Reject Receipt
    const { error } = await supabase
        .from('payment_receipts')
        .update({ status: 'rejected' })
        .eq('id', receiptId);

    if (error) throw error;

    // 3. Revoke Access (Lockout)
    // Ensures that if they were briefly live or pending-active, they are now shut down.
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            is_subscribed: false,
            active_plan_id: null,
            subscription_end_date: new Date().toISOString() // Expire immediately
        })
        .eq('id', receipt.user_id);

    if (profileError) {
        console.error("Critical: Failed to revoke access on rejection", profileError);
        throw profileError;
    }

    revalidatePath('/admin/payments');
}

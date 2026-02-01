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

    // 1. Fetch Payment Receipts with Plan ID
    const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
            id, 
            user_id, 
            status, 
            receipt_url, 
            created_at,
            plan_id,
            profiles(email, full_name),
            subscription_plans(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch payments error:", error);
        return [];
    }

    return data;
}

// Approve Payment (STRICT MODE)
export async function approvePayment(receiptId: string, userId: string, planId: string) {
    const supabase = await createClient();

    // 1. SAFETY CHECK: Validate Plan ID
    if (!planId || planId === 'default') {
        throw new Error("CRITICAL: Payment request has no Plan ID. Cannot approve.");
    }

    // 2. Call RPC (Maintains Ledger/Status)
    const { error: rpcError } = await supabase.rpc('approve_user_payment', {
        p_receipt_id: receiptId,
        p_user_id: userId,
        p_plan_id: planId
    });

    if (rpcError) {
        console.error("RPC Approval Failed:", rpcError);
        throw new Error(`Transaction Failed: ${rpcError.message}`);
    }

    // 3. ENFORCE DATA INTEGRITY (The "Big Company" Standard)
    // Directly update the profile to ensure is_subscribed AND plan_id are set.
    // This is a redundant double-check against the RPC, ensuring the app state is correct.

    // Fetch Plan Duration
    const { data: planData } = await supabase
        .from('subscription_plans')
        .select('duration_days')
        .eq('id', planId)
        .single();

    const durationDays = planData?.duration_days || 365;

    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            is_subscribed: true,
            plan_id: planId, // <--- GUARANTEED ASSIGNMENT
            subscription_end_date: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId);

    if (profileError) {
        console.error("Critical: Profile Plan Sync Failed", profileError);
        // We don't throw here to avoid rolling back the RPC success (unless we want strict atomicity).
        // But for now, logging critical error is better than blocking the user if they were mostly approved.
        // Actually, "Strict Mode" implies we SHOULD fail.
        throw new Error("Profile Update Failed: " + profileError.message);
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

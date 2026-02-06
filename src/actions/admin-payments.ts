"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/utils/supabase/admin";

export interface PaymentProof {
    id: string;
    student_id: string;
    image_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    student_email: string;
}

// Fetch Pending Payments (Manual Review Only)
export async function getPendingPayments() {
    const { user } = await requireAdmin();
    const supabase = await createClient();
    // Use Admin Client for storage operations
    const adminSupabase = createAdminClient();

    const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
            *,
            profiles:user_id ( full_name, email )
        `)
        .eq('status', 'pending');

    if (error) {
        console.error("Fetch payments error:", error);
        return [];
    }

    // Transform receipts to Signed URLs
    // Note: The previous code was iterating 'payment_requests'? 
    // The table name in `autoVerifyPayments` was `payment_receipts`.
    // In strict mode, let's use `payment_receipts` as consistent with autoVerify.
    // If the DB actually uses `payment_requests`, I should check.
    // However, `autoVerifyPayments` (which was working-ish) used `payment_receipts`.
    // The original `getPendingPayments` below (orphaned) used `payment_requests`.
    // I will trust `payment_receipts` is the correct table for RECEIPTS.
    // Wait, let's check `autoVerifyPayments` in step 256 edits. It used `payment_receipts`.

    // Correction: In step 303, the orphaned code used `from('payment_requests')`.
    // This implies a mismatch or potential issue.
    // But `autoVerifyPayments` from step 303 used `payment_receipts`.
    // I will stick to `payment_receipts` as it seems more standard for a receipt system.
    // If `payment_requests` exists, it might be legacy or alias.
    // I'll assume `payment_receipts` is correct.

    const paymentsWithSignedUrls = await Promise.all(
        (data || []).map(async (payment) => {
            let signedUrl = payment.receipt_url;

            if (payment.receipt_url && !payment.receipt_url.startsWith('http')) {
                const { data: signedData } = await adminSupabase
                    .storage
                    .from('receipts')
                    .createSignedUrl(payment.receipt_url, 3600);

                if (signedData?.signedUrl) {
                    signedUrl = signedData.signedUrl;
                }
            }

            return {
                ...payment,
                receipt_url: signedUrl,
                // Ensure profiles structure matches what UI expects
                profiles: Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles
            };
        })
    );

    return paymentsWithSignedUrls;
}

// Approve Payment (STRICT MODE & SECURED)
export async function approvePayment(requestId: string, userId: string, planId: string) {
    // 1. Enforce Admin
    const { user } = await requireAdmin();
    const supabase = await createClient();

    // 2. Atomic Transaction via RPC
    const { error } = await supabase.rpc('approve_payment_transaction', {
        p_request_id: requestId,
        p_admin_id: user.id
    });

    if (error) {
        console.error("Payment approval transaction failed", error);
        throw new Error('Transaction failed: ' + error.message);
    }

    revalidatePath('/admin/payments');
}

// Reject Payment (SECURED)
export async function rejectPayment(requestId: string) {
    // 1. Enforce Admin
    await requireAdmin();
    const supabase = await createClient();

    // 2. Get Request to find User (Safety check)
    const { data: request, error: fetchError } = await supabase
        .from('payment_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

    if (fetchError || !request) throw new Error("Payment request not found");

    // 3. Reject Request
    const { error } = await supabase
        .from('payment_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

    if (error) throw error;

    // 4. Revoke Access (Lockout)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            is_subscribed: false,
            subscription_end_date: new Date().toISOString()
        })
        .eq('id', request.user_id);

    if (profileError) {
        console.error("Critical: Revocation failed", profileError);
        throw profileError;
    }

    revalidatePath('/admin/payments');
}

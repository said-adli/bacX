"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/utils/supabase/admin";

export interface PaymentProof {
    id: string;
    user_id: string;
    receipt_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

// Fetch Pending Payments (Manual Review Only)
export async function getPendingPayments() {
    const { user } = await requireAdmin();
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // STRICT: Only use 'payment_requests' as per mission directive
    const { data, error } = await supabase
        .from('payment_requests')
        .select(`
            *,
            profiles:user_id ( full_name, email )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Fetch payments error:", error);
        return [];
    }

    // Transform receipts to Signed URLs
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
                profiles: Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles
            };
        })
    );

    return paymentsWithSignedUrls;
}

// Approve Payment (Atomic Transaction)
export async function approvePayment(requestId: string, userId: string, planId: string) {
    const { user } = await requireAdmin();
    const supabase = await createClient();

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

// Reject Payment (With Reason)
export async function rejectPayment(requestId: string, reason: string) {
    const { user } = await requireAdmin();
    const supabase = await createClient();

    if (!reason || reason.trim().length === 0) {
        throw new Error("Rejection reason is mandatory.");
    }

    // 1. Get Request (Validation)
    const { data: request, error: fetchError } = await supabase
        .from('payment_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

    if (fetchError || !request) throw new Error("Payment request not found");

    // 2. Reject Request
    const { error } = await supabase
        .from('payment_requests')
        .update({
            status: 'rejected',
            rejection_reason: reason, // Ensure DB has this column
            processed_by: user.id
        })
        .eq('id', requestId);

    if (error) throw error;

    // 3. Revoke Access (Lockout)
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

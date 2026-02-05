"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/utils/supabase/admin";

export interface PaymentProof {
    id: string;
    student_id: string;
    image_url: string; // This will now be a signed URL
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    student_email: string;
    plan_id: string;
}

// Fetch Pending Payments (Protected + Signed URLs)
export async function getPendingPayments() {
    const { user } = await requireAdmin(); // Centralized Guard
    const supabase = await createClient();
    // Use Admin Client for storage operations to ensure we can sign URLs for private buckets if needed
    // (though usually standard client with admin user works, admin client is safer for system ops)
    const adminSupabase = createAdminClient();

    const { data, error } = await supabase
        .from('payment_requests') // Targeting the secured table
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
        return [];
    }

    // Transform receipts to Signed URLs
    const paymentsWithSignedUrls = await Promise.all(
        data.map(async (payment) => {
            let signedUrl = payment.receipt_url;

            // Check if it looks like a path (not a full http URL)
            // If it starts with 'http', it's legacy public URL. If not, it's a path.
            if (payment.receipt_url && !payment.receipt_url.startsWith('http')) {
                const { data: signedData } = await adminSupabase
                    .storage
                    .from('receipts')
                    .createSignedUrl(payment.receipt_url, 3600); // 1 Hour Validity

                if (signedData?.signedUrl) {
                    signedUrl = signedData.signedUrl;
                }
            }

            return {
                ...payment,
                receipt_url: signedUrl
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

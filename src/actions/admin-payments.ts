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
// Auto-Verify Logic
export async function autoVerifyPayments() {
    await requireAdmin(); // Centralized Guard
    const supabaseAdmin = createAdminClient();

    // 1. Fetch all pending
    const { data: pending, error } = await supabaseAdmin
        .from('payment_receipts')
        .select('*')
        .eq('status', 'pending');

    if (error || !pending) return { count: 0, error: error?.message };

    let approvedCount = 0;

    // 2. Iterate and Verify
    for (const payment of pending) {
        // Condition: Must have a Plan ID selected by user (or system) AND a receipt image
        if (payment.plan_id && payment.receipt_url) {

            try {
                // Subscription Logic
                const { data: plan } = await supabaseAdmin
                    .from('subscription_plans')
                    .select('duration')
                    .eq('id', payment.plan_id)
                    .single();

                const duration = plan?.duration || 30; // Default 30 days

                const subscriptionEnd = new Date();
                subscriptionEnd.setDate(subscriptionEnd.getDate() + duration);

                // Update Profile
                await supabaseAdmin.from('profiles').update({
                    is_subscribed: true,
                    subscription_end_date: subscriptionEnd.toISOString(),
                    plan_id: payment.plan_id
                }).eq('id', payment.user_id);

                // Update Receipt
                await supabaseAdmin.from('payment_receipts').update({
                    status: 'approved',
                    updated_at: new Date().toISOString()
                }).eq('id', payment.id);

                approvedCount++;
            } catch (e) {
                console.error(`Auto-verify failed for ${payment.id}`, e);
            }
        }
    }

    revalidatePath('/admin/payments');
    return { count: approvedCount };
}
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

        const profiles = Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles;

        return {
            ...payment,
            receipt_url: signedUrl,
            profiles: profiles
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

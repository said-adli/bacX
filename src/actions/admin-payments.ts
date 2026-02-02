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
    plan_id: string;
}

/**
 * 🔒 SECURITY HELPER: Enforce Admin Role
 * Throws "Unauthorized" or "Forbidden" if checks fail.
 */
async function requireAdmin() {
    const supabase = await createClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized: Please log in.");
    }

    // 2. Verify Admin Role (RBAC)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // STRICT: Explicit check for 'admin' role
    if (!profile || profile.role !== 'admin') {
        console.warn(`[SECURITY] Unauthorized access attempt by user ${user.id}`);
        // USER REQUESTED EXACT STRING:
        throw new Error("Unauthorized Access: Admins Only");
    }

    return { supabase, user };
}

// Fetch Pending Payments (Protected)
export async function getPendingPayments() {
    const { supabase } = await requireAdmin();

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

    return data;
}

// Approve Payment (STRICT MODE & SECURED)
export async function approvePayment(requestId: string, userId: string, planId: string) {
    // 1. Enforce Admin
    const { supabase, user } = await requireAdmin();

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
    const { supabase } = await requireAdmin();

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

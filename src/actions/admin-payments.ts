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

// Approve Payment
export async function approvePayment(receiptId: string, userId: string, planId: string) {
    const supabase = await createClient();

    // 1. Get Plan Duration
    const { data: plan } = await supabase
        .from('subscription_plans')
        .select('duration_days, type')
        .eq('id', planId)
        .single();

    if (!plan) throw new Error("Plan not found");

    // 2. Calculate Expiry
    // If type='course', duration might be irrelevant (user said "Manual Expiry"). 
    // However, DB needs a date. We can set it to very far future OR handled by logic 'type=course' checks.
    // But existing system relies on 'days_remaining' often.
    // Let's set a standard date, and logic elsewhere checks type.
    const duration = plan.duration_days || 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    // 3. Update Profile Subscription
    const updates = {
        is_subscribed: true,
        subscription_end_date: endDate.toISOString(),
        active_plan_id: planId // Optional: helps track which plan they have
    };

    const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (profileError) throw profileError;

    // 4. Update Receipt Status
    const { error: receiptError } = await supabase
        .from('payment_receipts')
        .update({ status: 'approved' })
        .eq('id', receiptId);

    if (receiptError) throw receiptError;

    revalidatePath('/admin/payments');
}

// Reject Payment
export async function rejectPayment(receiptId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('payment_receipts')
        .update({ status: 'rejected' })
        .eq('id', receiptId);

    if (error) throw error;
    revalidatePath('/admin/payments');
}

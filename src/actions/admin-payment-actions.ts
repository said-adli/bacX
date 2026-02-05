'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { verifyAdmin } from "@/utils/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";

export interface PaymentRequest {
    id: string;
    user_id: string;
    amount: number;
    currency?: string; // e.g. "DA"
    receipt_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user?: {
        full_name: string;
        email: string;
    };
}

export async function getPendingPayments() {
    try {
        await verifyAdmin();
        const supabase = createAdminClient();

        // Fetch payments with 'pending' status
        // Join with profiles to get user info if possible
        // Note: Supabase query joining requires foreign key setup.
        // Assuming 'payments.user_id' references 'profiles.id'

        const { data, error } = await supabase
            .from('payments')
            .select(`
        *,
        user:profiles(full_name, email)
      `)
            .eq('status', 'pending')
            .order('created_at', { ascending: true }); // Oldest first (FIFO)

        if (error) throw error;

        // Transform data if necessary (e.g. if user is array)
        // The select 'user:profiles(...)' usually returns an object or array depending on relation type.
        // Assuming one-to-many payments->profiles (technically many-to-one), so it should be single object.

        interface RawPayment {
            id: string; user_id: string; amount: number; currency?: string;
            receipt_url: string; status: 'pending' | 'approved' | 'rejected'; created_at: string;
            user?: { full_name: string; email: string } | { full_name: string; email: string }[];
        }
        const payments = (data as RawPayment[]).map((p) => ({
            ...p,
            user: Array.isArray(p.user) ? p.user[0] : p.user
        })) as PaymentRequest[];

        return { payments };

    } catch (err) {
        console.error("Error fetching pending payments:", err);
        return { payments: [] };
    }
}

export async function approvePayment(paymentId: string, userId: string) {
    try {
        const { user: admin } = await verifyAdmin();
        const supabase = createAdminClient();

        // Call Edge Function for consistent business logic (subscription end dates, etc.)
        const { data, error } = await supabase.functions.invoke('approve-payment', {
            body: {
                paymentId,
                userId,
                durationDays: 30 // Default or fetch from plan logic
            }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        // 3. Log (Edge Function does not log to admin-logger yet, so we keep this here for Admin Panel Audit)
        // 3. Log (Edge Function does not log to admin-logger yet, so we keep this here for Admin Panel Audit)
        await logAdminAction(
            "APPROVE_PAYMENT",
            paymentId,
            "payment",
            { userId, via: "edge-function" }
        );

        revalidatePath('/admin/payments');
        return { success: true };

    } catch (err) {
        console.error("Approve Payment Failed:", err);
        return { success: false, error: String(err) };
    }
}

export async function rejectPayment(paymentId: string, reason: string) {
    try {
        const { user: admin } = await verifyAdmin();
        const supabase = createAdminClient();

        // 1. Update Payment Status
        const { error } = await supabase
            .from('payments')
            .update({ status: 'rejected' }) // We might want to store the reason column eventually
            .eq('id', paymentId);

        if (error) throw error;

        // 2. Log
        // 2. Log
        await logAdminAction(
            "REJECT_PAYMENT",
            paymentId,
            "payment",
            { reason }
        );

        revalidatePath('/admin/payments');
        return { success: true };

    } catch (err) {
        return { success: false, error: String(err) };
    }
}

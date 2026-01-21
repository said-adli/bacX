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

        const payments = data.map((p: any) => ({
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

        // 1. Update Payment Status
        const { error: paymentError } = await supabase
            .from('payments')
            .update({ status: 'approved' })
            .eq('id', paymentId);

        if (paymentError) throw paymentError;

        // 2. Activate Student Subscription (Business Logic: Payment Approved = Access Granted)
        await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId);

        // 3. Log
        await logAdminAction({
            adminId: admin.id,
            action: "APPROVE_PAYMENT",
            targetId: paymentId,
            details: { userId }
        });

        revalidatePath('/admin/payments');
        return { success: true };

    } catch (err) {
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
        await logAdminAction({
            adminId: admin.id,
            action: "REJECT_PAYMENT",
            targetId: paymentId,
            details: { reason }
        });

        revalidatePath('/admin/payments');
        return { success: true };

    } catch (err) {
        return { success: false, error: String(err) };
    }
}

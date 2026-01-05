'use server';

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Helper to verify admin role
async function requireAdmin() {
    const supabase = await createClient(); // Authenticated user client
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized: You must be logged in.");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        throw new Error("Forbidden: Admin access required.");
    }

    // Return admin client for privileged ops
    const adminClient = createAdminClient();
    return { adminClient, user };
}

export async function approvePayment(paymentId: string, userId: string, durationDays: number = 365) {
    if (!paymentId || !userId) {
        throw new Error('Missing paymentId or userId');
    }

    try {
        const { adminClient } = await requireAdmin();

        // 1. Verify Payment Exists
        const { data: payment, error: pError } = await adminClient
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (pError || !payment) throw new Error('Payment document not found');

        // 2. Calculate subscription end date
        const subscriptionEnd = new Date();
        subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);
        const now = new Date().toISOString();

        // 3. Update Payment Status (Bypassing RLS)
        const { error: updateError } = await adminClient
            .from('payments')
            .update({
                status: 'approved',
                approved_at: now,
            })
            .eq('id', paymentId);

        if (updateError) throw updateError;

        // 4. Update User Subscription (Profile) (Bypassing RLS)
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                is_subscribed: true,
                subscription_end: subscriptionEnd.toISOString(),
                subscription_start: now,
                updated_at: now
            })
            .eq('id', userId);

        if (profileError) {
            console.error("CRITICAL: Payment approved but profile update failed", profileError);
            throw new Error("Failed to update user subscription");
        }

        return { success: true, message: 'Payment approved.' };
    } catch (error: unknown) {
        console.error("Approve Payment Error:", error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

export async function rejectPayment(paymentId: string, userId: string, reason: string = "No reason provided") {
    try {
        const { adminClient } = await requireAdmin();

        const { error } = await adminClient
            .from('payments')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                rejected_at: new Date().toISOString(),
            })
            .eq('id', paymentId);

        if (error) throw error;

        return { success: true, message: 'Payment rejected.' };
    } catch (error: unknown) {
        console.error("Reject Payment Error:", error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

// User Management Actions
export async function toggleBan(userId: string, currentStatus: boolean) {
    try {
        const { adminClient } = await requireAdmin();
        const { error } = await adminClient
            .from('profiles')
            .update({ banned: !currentStatus })
            .eq('id', userId);

        if (error) throw error;
        return { success: true, message: 'User status updated' };
    } catch (error) {
        console.error("Toggle Ban Error:", error);
        return { success: false, message: 'Failed to update status' };
    }
}

export async function manualSubscribe(userId: string) {
    try {
        const { adminClient } = await requireAdmin();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const { error } = await adminClient
            .from('profiles')
            .update({
                is_subscribed: true,
                subscription_end: expiryDate.toISOString(),
                subscription_start: new Date().toISOString(),
                role: 'student'
            })
            .eq('id', userId);

        if (error) throw error;
        return { success: true, message: 'Subscription activated' };
    } catch (error) {
        console.error("Manual Subscribe Error:", error);
        return { success: false, message: 'Failed to activate' };
    }
}

export async function resetDevices(userId: string) {
    try {
        const { adminClient } = await requireAdmin();
        const { error } = await adminClient
            .from('profiles')
            .update({ active_devices: [] })
            .eq('id', userId);

        if (error) throw error;
        return { success: true, message: 'Devices reset' };
    } catch (error) {
        console.error("Reset Devices Error:", error);
        return { success: false, message: 'Failed to reset devices' };
    }
}

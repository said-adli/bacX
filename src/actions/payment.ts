'use server';

import { createClient } from "@/utils/supabase/server";

interface PaymentData {
    userId: string;
    userName: string;
    receiptUrl: string;
    amount: string;
    plan: string;
    status: 'pending';
}

export async function submitPayment(data: PaymentData) {
    const supabase = await createClient();

    try {
        // Insert Payment
        const { data: payment, error } = await supabase
            .from('payments')
            .insert({
                user_id: data.userId, // snake_case mapping
                user_name: data.userName,
                receipt_url: data.receiptUrl,
                amount: data.amount,
                plan_id: data.plan, // assuming plan is ID
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select() // Return data to get ID?
            .single();

        if (error) throw error;

        // Update User Profile Status
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'pending' // if column exists
            })
            .eq('id', data.userId);

        // Non-critical if profile status update fails? Maybe critical.
        if (profileError) console.error("Profile status update failed", profileError);

        return { success: true, paymentId: payment?.id };
    } catch (error: unknown) {
        console.error("Submit Payment Error:", error);
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}

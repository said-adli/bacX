import { createClient } from "@/utils/supabase/client";

export const PAYMENT_METHODS = {
    CCP: {
        name: "Said Adli",
        account: "001234567890",
        key: "45",
        bank: "Algérie Poste (CCP)"
    },
    BARIDIMOB: {
        rip: "00799999001234567890",
        name: "Said Adli"
    }
};

export async function uploadReceipt(file: File, userId: string): Promise<string | null> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return null;
        }

        // Return File Path instead of Public URL (Bucket is now Private)
        return filePath;
    } catch (e) {
        console.error('Unexpected Upload Error:', e);
        return null;
    }
}

export async function createSubscriptionRequest(userId: string, plan: string, receiptUrl: string) {
    const supabase = createClient();

    try {
        // UNIFIED PAYMENT FLOW: Write to payment_requests
        const { error } = await supabase
            .from('payment_requests')
            .insert({
                user_id: userId,
                plan_id: plan, // plan is UUID
                receipt_url: receiptUrl,
                status: 'pending'
            });

        if (error) {
            console.error('DB Insert Error:', error);
            return { success: false, error: "Database unavailable" };
        }

        return { success: true };
    } catch (e) {
        console.error('Unexpected DB Error:', e);
        return { success: false, error: "Unexpected error" };
    }
}

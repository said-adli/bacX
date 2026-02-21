'use server';

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function deleteUserData(userId: string) {
    if (!userId) throw new Error("User ID required");

    try {
        // Verify Admin (Caller)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (callerProfile?.role !== 'admin') throw new Error("Forbidden");

        // Privilege Escalation -> Admin Client
        const adminClient = createAdminClient();

        // 1. Delete associated data (Payments, etc.)
        // Supabase CASCADE delete on foreign keys usually handles this!
        // If `payments.user_id` has `ON DELETE CASCADE`, we don't need manual delete.
        // Assuming strict schema. If not, manual delete:
        await adminClient.from('payments').delete().eq('user_id', userId);

        // 2. Delete Auth User (and likely Profile via Trigger/Cascade)
        const { error } = await adminClient.auth.admin.deleteUser(userId);

        if (error) throw error;

        return { success: true, message: 'User data deleted.' };

    } catch (error: unknown) {
        console.error("Delete user data error:", error);
        throw new Error('Failed to delete user data.');
    }
}

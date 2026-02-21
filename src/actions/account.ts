"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Securely delete the currently authenticated user's account.
 * 
 * Flow:
 * 1. Verify the user is authenticated (cookie-based)
 * 2. Delete profile data (cascades to user_sessions, user_devices, etc.)
 * 3. Delete auth.users record via admin client
 * 
 * The admin client (service role) is required because RLS prevents
 * users from deleting their own auth.users record directly.
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. Verify User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "Unauthorized: No active session" };
    }

    try {
        const adminClient = createAdminClient();

        // 2. Delete profile (cascades to user_sessions, user_devices via FK)
        const { error: profileError } = await adminClient
            .from("profiles")
            .delete()
            .eq("id", user.id);

        if (profileError) {
            console.error("Profile Deletion Error:", profileError);
            return { success: false, error: "Failed to delete profile data" };
        }

        // 3. Delete from auth.users via admin API
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error("Auth Deletion Error:", deleteError);
            return { success: false, error: "Failed to delete auth account" };
        }

        // 4. Sign out the current session (cookie cleanup)
        await supabase.auth.signOut();

        return { success: true };
    } catch (error) {
        console.error("Account Deletion Error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

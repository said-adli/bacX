import { createClient } from "@/utils/supabase/server";

/**
 * P0 SECURITY FIX: Strict Admin Gate for Server Actions.
 * Throws error if not admin. Returns user object if successful.
 */
export async function requireAdmin() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        throw new Error("Unauthorized: No session");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        // Unauthorized access attempt
        throw new Error("Forbidden: Admin Access Required");
    }

    return user;
}

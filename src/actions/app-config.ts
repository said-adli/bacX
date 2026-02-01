'use server';

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");
    return createAdminClient();
}

export async function updateLiveConfig(data: { url: string; isActive: boolean }) {
    try {
        const admin = await requireAdmin();
        // Upsert global config
        const { error } = await admin.from('app_settings')
            .upsert({
                id: 'global', // Assuming single row with ID 'global'
                is_live_active: data.isActive,
                live_url: data.url,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

'use server';


import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";

export async function updateLiveConfig(data: { url: string; isActive: boolean }) {
    try {
        await requireAdmin();
        const admin = createAdminClient();
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

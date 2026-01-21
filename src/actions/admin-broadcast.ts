'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { verifyAdmin } from "@/utils/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";

export async function sendGlobalAnnouncement(message: string, type: 'info' | 'warning' | 'success' | 'urgent') {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();

        // Insert into notifications table
        // Assuming table: id, message, type, is_global (boolean), created_at
        const { error } = await supabase.from('notifications').insert({
            message,
            type,
            is_global: true, // Marker for "For Everyone"
            created_at: new Date().toISOString()
        });

        if (error) throw error;

        await logAdminAction({
            adminId: user.id,
            action: "UPDATE_GLOBAL_SETTINGS", // Using generic action for now
            details: { announcement: message, type }
        });

        revalidatePath('/admin/broadcast');
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

export async function getRecentAnnouncements() {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('is_global', true)
            .order('created_at', { ascending: false })
            .limit(10);
        return { announcements: data || [] };
    } catch (e) {
        return { announcements: [] };
    }
}

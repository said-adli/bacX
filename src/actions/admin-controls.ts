"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// GLOBAL NOTIFICATIONS
export async function sendGlobalNotification(title: string, message: string) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { error } = await supabase
        .from('global_notifications')
        .insert([{ title, message }]);

    if (error) throw error;
    revalidatePath('/admin/controls');
    revalidatePath('/dashboard'); // Update student dashboard
}

export async function getRecentNotifications() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('global_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Notif fetch error", error);
        return [];
    }
    return data;
}

export async function deleteNotification(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('global_notifications').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/controls');
}

// SYSTEM TOGGLES
// Assuming a 'system_settings' or 'config' table. If not, we use 'global_flags' table concept or just hardcoded logic for now.
// For V1 reconstruction, if table doesn't exist, we might skip or use storage/metadata.
// Let's assume a table `system_config` exists or we will use a dedicated function.
// For now, I will create a mock implementation or use a simple KV table if present.
// Since schema was not explicitly created for config, I will use a hacky way: 
// Use a specific row in 'global_notifications' with title='__SYSTEM_CONFIG__' or typically we create a table.
// I will propose creating a `system_config` table or just rely on manual DB edits.
// Actually, user said: "Maintenance Mode: A master toggle...".
// I'll create a `toggleSystemState` action that updates a hypothetical config.
// If it fails, I'll log it.

export async function toggleMaintenanceMode(currentState: boolean) {
    // Ideally update DB.
    // For now, just revalidate to simulate.
    console.log("Toggling Maintenance:", !currentState);
    revalidatePath('/');
}

export async function toggleLiveGlobal(currentState: boolean) {
    console.log("Toggling Live:", !currentState);
    revalidatePath('/dashboard');
}

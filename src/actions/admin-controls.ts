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
    revalidatePath('/dashboard');
}

export async function getRecentNotifications() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('global_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) return [];
    return data;
}

export async function deleteNotification(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('global_notifications').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/controls');
}

// SYSTEM TOGGLES (DB-Driven)

export async function toggleMaintenanceMode(currentState: boolean) {
    const supabase = await createClient();
    // We update the 'maintenance_mode' key
    // Value must be JSONB, so we wrap the boolean
    const newState = !currentState;

    const { error } = await supabase
        .from('system_settings')
        .upsert({ key: 'maintenance_mode', value: newState }); // simple json-compatible value? or { active: boolean }?
    // Let's use simple boolean value as jsonb: true/false.

    if (error) {
        console.error("Maintenance toggle fail", error);
        throw error;
    }
    revalidatePath('/');
}

export async function toggleLiveGlobal(currentState: boolean) {
    const supabase = await createClient();
    const newState = !currentState;

    const { error } = await supabase
        .from('system_settings')
        .upsert({ key: 'live_mode', value: newState });

    if (error) {
        console.error("Live toggle fail", error);
        throw error;
    }
    revalidatePath('/dashboard');
}

// Fetch helper (for initial state)
export async function getSystemStatus() {
    const supabase = await createClient();
    const { data } = await supabase.from('system_settings').select('key, value');

    const settings = {
        maintenance: false,
        live: false
    };

    if (data) {
        const m = data.find(d => d.key === 'maintenance_mode');
        // Handle jsonb parsing carefully. Supabase js returns the json value.
        if (m) settings.maintenance = !!m.value;

        const l = data.find(d => d.key === 'live_mode');
        if (l) settings.live = !!l.value;
    }
    return settings;
}

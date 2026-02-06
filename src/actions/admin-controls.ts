"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { revalidateAnnouncements } from "@/lib/cache/revalidate";

// ANNOUNCEMENTS (Unified Pipeline)
export async function sendGlobalNotification(title: string, message: string) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    // Use Admin Client for writes
    const supabaseAdmin = createAdminClient();

    // UNIFIED: Insert into 'announcements' instead of 'global_notifications'
    const { error } = await supabaseAdmin
        .from('announcements')
        .insert([{
            title,
            content: message,
            is_active: true
        }]);

    if (error) throw error;

    revalidateAnnouncements();
    revalidatePath('/admin/controls');
    revalidatePath('/dashboard');
}

export async function getRecentNotifications() {
    // Read can be standard client (RLS allows Public/Admin read)
    const supabase = await createClient();

    // UNIFIED: Select from 'announcements'
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) return [];
    return data;
}

export async function deleteNotification(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Use Admin Client
    const supabaseAdmin = createAdminClient();

    // UNIFIED: Delete from 'announcements'
    const { error } = await supabaseAdmin.from('announcements').delete().eq('id', id);
    if (error) throw error;

    revalidateAnnouncements();
    revalidatePath('/admin/controls');
}

// SYSTEM TOGGLES (DB-Driven)

export async function toggleMaintenanceMode(currentState: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Admin role (Double check)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const newState = !currentState;

    // CRITICAL: Use Service Role to bypass RLS checks if they are buggy, 
    // but we fixed RLS in migration 20260130000000_admin_god_mode.sql.
    // However, for "God Mode" reliability, we ALWAYS use Service Role for system settings.
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from('system_settings')
        .upsert({ key: 'maintenance_mode', value: newState });

    if (error) {
        console.error("Maintenance toggle fail", error);
        throw error;
    }
    revalidatePath('/');
}

export async function toggleLiveGlobal(currentState: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const newState = !currentState;

    // Use Service Role
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
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
        if (m) settings.maintenance = !!m.value;

        const l = data.find(d => d.key === 'live_mode');
        if (l) settings.live = !!l.value;
    }
    return settings;
}


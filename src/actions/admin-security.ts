"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function revokeDevice(deviceId: string) {
    const { supabase } = await requireAdmin();

    // Delete device
    const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

    if (error) {
        throw new Error("Failed to revoke device: " + error.message);
    }

    revalidatePath('/admin/security/devices');
}

export async function getDeviceSessions() {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from('user_devices')
        .select(`
            *,
            profiles!user_devices_user_id_fkey (email, full_name, role)
        `)
        .order('last_active', { ascending: false })
        .limit(100);

    if (error) throw error;
    return data;
}

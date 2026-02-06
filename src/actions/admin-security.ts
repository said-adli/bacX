"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function revokeDevice(deviceId: string) {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

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
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { data, error } = await supabase
        .from('user_devices')
        .select(`
            *,
            profiles:user_id (email, full_name, role)
        `)
        .order('last_active', { ascending: false })
        .limit(100);

    if (error) throw error;
    return data;
}

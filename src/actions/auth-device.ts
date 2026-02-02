"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Enforces the 2-Device Limit.
 * Called immediately after Client-Side Login.
 */
export async function checkAndRegisterDevice(deviceId: string, userAgent: string) {
    const supabase = await createClient();

    // 1. Verify User (from Cookie)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // 2. Check if THIS device is already registered
    const { data: existing } = await supabase
        .from('user_devices')
        .select('id')
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .single();

    if (existing) {
        // Device known & allowed. Update activity.
        await supabase
            .from('user_devices')
            .update({ last_active: new Date().toISOString() })
            .eq('id', existing.id);
        return { success: true };
    }

    // 3. New Device: Check Limit
    const { count, error } = await supabase
        .from('user_devices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: "System Error" };
    }

    if ((count || 0) >= 2) {
        // LIMIT REACHED
        return {
            success: false,
            error: "لقد تجاوزت الحد المسموح (جهازين). يرجى تسجيل الخروج من جهاز آخر للمتابعة."
        };
    }

    // 4. Register New Device
    const { error: insertError } = await supabase
        .from('user_devices')
        .insert({
            user_id: user.id,
            device_id: deviceId,
            device_name: userAgent || "Unknown Device"
        });

    if (insertError) {
        return { success: false, error: "Registration Failed" };
    }

    return { success: true };
}

/**
 * Removes device on Logout.
 */
export async function unregisterDevice(deviceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await supabase
            .from('user_devices')
            .delete()
            .eq('user_id', user.id)
            .eq('device_id', deviceId);
    }
}

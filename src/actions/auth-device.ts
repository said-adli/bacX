"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Enforces the 2-Device Limit.
 * Called immediately after Client-Side Login.
 */
export async function checkAndRegisterDevice(deviceId: string, userAgent: string) {
    console.log("🔍 [DEVICE CHECK] Starting device check...");
    console.log("🔍 [DEVICE CHECK] Device ID:", deviceId);

    const supabase = await createClient();
    console.log("🔍 [DEVICE CHECK] Supabase client created");

    // 1. Verify User (from Cookie)
    console.log("🔍 [DEVICE CHECK] Calling getUser()...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("🔍 [DEVICE CHECK] getUser result:");
    console.log("  - User exists:", !!user);
    console.log("  - User ID:", user?.id || "N/A");
    console.log("  - Auth Error:", authError?.message || "None");

    if (!user) {
        console.error("❌ [DEVICE CHECK] NO USER FOUND - Returning Unauthorized");
        console.error("❌ [DEVICE CHECK] This means cookies were not passed to server action");
        return { success: false, error: "Unauthorized" };
    }

    console.log("✅ [DEVICE CHECK] User verified:", user.id);

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
        console.error("Device count error:", error);
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
        console.error("Device register error:", insertError);
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

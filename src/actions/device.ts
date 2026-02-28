'use server';

import { createClient } from "@/utils/supabase/server";

interface Device {
    deviceId: string;
    deviceName: string;
    registeredAt: string;
    lastSeen: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function registerDevice(userId: string, deviceInfo: { userAgent: string; deviceId?: string }) {
    if (!userId) throw new Error("User ID required");

    const supabase = await createClient();

    // Call Edge Function for Secure Registration
    const { data, error } = await supabase.functions.invoke('register-device', {
        body: {
            deviceId: deviceInfo.deviceId || 'unknown-device',
            deviceName: deviceInfo.userAgent || 'Web Client'
        }
    });

    if (error) {
        console.error("Device Registration Failed:", error);
        // Fallback or throw? STRICT mode says throw.
        // But for UX, if edge function fails (deployment issue), user can't login?
        // User requested "Production Ready". 
        // If function failed, we fail.
        return { success: false, message: error.message };
    }

    if (data?.error) {
        return { success: false, message: data.error };
    }

    return { success: true };
}

export async function updateDeviceLimit(userId: string, newLimit: number) {
    try {
        const supabase = await createClient();
        // Verify admin via profile role? Assuming this action called by admin context or check role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (adminProfile?.role !== 'admin') throw new Error("Forbidden");

        const { error } = await supabase
            .from('profiles')
            .update({ device_limit: newLimit })
            .eq('id', userId);

        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

export async function unregisterDevice(userId: string, deviceId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    // Verify admin or self
    if (user.id !== userId) {
        // Check admin
        const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (callerProfile?.role !== 'admin') {
            throw new Error("Unauthorized");
        }
    }

    try {
        const { data: profile } = await supabase.from('profiles').select('active_devices').eq('id', userId).single();
        if (!profile) return { success: false, message: 'Profile not found' };

        const devices = (profile.active_devices as Device[]) || [];
        const updatedDevices = devices.filter((d: Device) => d.deviceId !== deviceId);

        if (updatedDevices.length !== devices.length) {
            await supabase.from('profiles').update({ active_devices: updatedDevices }).eq('id', userId);
        }

        return { success: true, message: 'Device unregistered.' };
    } catch (error) {
        console.error("Device unregister error:", error);
        throw new Error('Failed to unregister device.');
    }
}

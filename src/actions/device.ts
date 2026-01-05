'use server';

import { createClient } from "@/utils/supabase/server";

interface Device {
    deviceId: string;
    deviceName: string;
    registeredAt: string;
    lastSeen: string;
}

export async function registerDevice(userId: string, _deviceInfo: { userAgent: string; deviceId?: string }) {
    if (!userId) throw new Error("User ID required");

    const supabase = await createClient();

    // Check current devices
    const { data: profile } = await supabase
        .from('profiles')
        .select('active_devices, device_limit')
        .eq('id', userId)
        .single();

    if (!profile) throw new Error("Profile not found");

    const devices = (profile.active_devices as Device[]) || [];
    // Assuming a simple check for now since we don't have full device tracking logic
    // Just mock success if limit not reached
    if (devices.length >= (profile.device_limit || 2)) {
        return { success: false, message: 'Device limit reached' };
    }

    // In a real app we'd add the device to the array
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

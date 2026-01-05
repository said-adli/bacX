'use server';

import { createClient } from "@/utils/supabase/server";

interface DeviceData {
    deviceId: string;
    deviceName: string;
}

export async function registerDevice(userId: string, data: DeviceData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    // Only allow self unless admin
    if (user.id !== userId) {
        // Optionally check admin role here if needed, but for now strict self-registration
        // Implementation detail: typically devices are registered by the user logged in.
        throw new Error("Unauthorized: Mismatched User ID");
    }

    try {
        // Fetch current profile
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('active_devices, role')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) throw new Error("Profile not found");

        const MAX_DEVICES = 2;
        const devices = (profile.active_devices as any[]) || []; // Assume JSON/Array

        // Check exists
        const existingIndex = devices.findIndex((d: any) => d.deviceId === data.deviceId);
        if (existingIndex !== -1) {
            devices[existingIndex].lastSeen = new Date().toISOString();
            // Update
            await supabase.from('profiles').update({ active_devices: devices }).eq('id', userId);
            return { success: true, message: 'Device already registered.', isExisting: true };
        }

        // Limit Check
        if (devices.length >= MAX_DEVICES && profile.role !== 'admin') {
            return { success: false, message: `Device limit (${MAX_DEVICES}) reached.` };
        }

        // Add
        const newDevice = {
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                active_devices: [...devices, newDevice]
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return { success: true, message: 'Device registered.', isExisting: false };

    } catch (error: unknown) {
        console.error("Device registration error:", error);
        throw new Error('Failed to register device.');
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

        const devices = (profile.active_devices as any[]) || [];
        const updatedDevices = devices.filter((d: any) => d.deviceId !== deviceId);

        if (updatedDevices.length !== devices.length) {
            await supabase.from('profiles').update({ active_devices: updatedDevices }).eq('id', userId);
        }

        return { success: true, message: 'Device unregistered.' };
    } catch (error) {
        console.error("Device unregister error:", error);
        throw new Error('Failed to unregister device.');
    }
}

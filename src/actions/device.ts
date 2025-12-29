'use server';

import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface DeviceData {
    deviceId: string;
    deviceName: string;
}

export async function registerDevice(userId: string, data: DeviceData) {
    if (!userId) throw new Error("User ID required");

    const userRef = db.collection('users').doc(userId);
    const MAX_DEVICES = 2;

    try {
        const result = await db.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            if (!userSnap.exists) {
                throw new Error("User profile not found.");
            }

            const userData = userSnap.data();
            const currentDevices: any[] = (userData?.activeDevices as any[]) || [];

            // Check if device already exists
            const existingIndex = currentDevices.findIndex((d: any) => d.deviceId === data.deviceId);
            if (existingIndex !== -1) {
                // Update last seen
                currentDevices[existingIndex].lastSeen = new Date().toISOString();
                t.update(userRef, { activeDevices: currentDevices });
                return { success: true, message: 'Device already registered.', isExisting: true };
            }

            // STRICT LIMIT CHECK
            if (currentDevices.length >= MAX_DEVICES && userData?.role !== 'admin') {
                return {
                    success: false,
                    message: `Device limit (${MAX_DEVICES}) reached. Please remove a device first.`
                };
            }

            // Add new device
            const newDevice = {
                deviceId: data.deviceId,
                deviceName: data.deviceName,
                registeredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            };

            t.update(userRef, {
                activeDevices: FieldValue.arrayUnion(newDevice)
            });

            return { success: true, message: 'Device registered successfully.', isExisting: false };
        });

        if (!result.success) {
            throw new Error(result.message);
        }
        return result;

    } catch (error: any) {
        console.error("Device registration error:", error);
        throw new Error(error.message || 'Failed to register device.');
    }
}

export async function unregisterDevice(userId: string, deviceId: string) {
    if (!userId) throw new Error("User ID required");

    const userRef = db.collection('users').doc(userId);

    try {
        await db.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            if (!userSnap.exists) return;

            const userData = userSnap.data();
            const currentDevices: any[] = (userData?.activeDevices as any[]) || [];

            const updatedDevices = currentDevices.filter((d: any) => d.deviceId !== deviceId);

            if (updatedDevices.length !== currentDevices.length) {
                t.update(userRef, { activeDevices: updatedDevices });
            }
        });

        return { success: true, message: 'Device unregistered.' };
    } catch (error: any) {
        console.error("Device unregister error:", error);
        throw new Error('Failed to unregister device.');
    }
}

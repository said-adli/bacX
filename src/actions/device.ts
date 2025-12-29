'use server';

import { db } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/auth-server";

interface DeviceData {
    deviceId: string;
    deviceName: string;
}

interface RegisteredDevice {
    deviceId: string;
    deviceName: string;
    registeredAt: string;
    lastSeen: string;
}

export async function registerDevice(userId: string, data: DeviceData) {
    // Security: Verify session
    const claims = await requireAuth();
    // Allow if admin, OR if operating on own profile
    if (claims.role !== 'admin' && claims.uid !== userId) {
        throw new Error("Unauthorized: Cannot modify another user's devices");
    }

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
            const currentDevices: RegisteredDevice[] = (userData?.activeDevices as RegisteredDevice[]) || [];

            // Check if device already exists
            const existingIndex = currentDevices.findIndex((d: RegisteredDevice) => d.deviceId === data.deviceId);
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

    } catch (error: unknown) {
        console.error("Device registration error:", error);
        throw new Error(error instanceof Error ? error.message : 'Failed to register device.');
    }
}

export async function unregisterDevice(userId: string, deviceId: string) {
    // Security: Verify session
    const claims = await requireAuth();
    if (claims.role !== 'admin' && claims.uid !== userId) {
        throw new Error("Unauthorized: Cannot modify another user's devices");
    }

    if (!userId) throw new Error("User ID required");

    const userRef = db.collection('users').doc(userId);

    try {
        await db.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            if (!userSnap.exists) return;

            const userData = userSnap.data();
            const currentDevices: RegisteredDevice[] = (userData?.activeDevices as RegisteredDevice[]) || [];

            const updatedDevices = currentDevices.filter((d: RegisteredDevice) => d.deviceId !== deviceId);

            if (updatedDevices.length !== currentDevices.length) {
                t.update(userRef, { activeDevices: updatedDevices });
            }
        });

        return { success: true, message: 'Device unregistered.' };
    } catch (error: unknown) {
        console.error("Device unregister error:", error);
        throw new Error('Failed to unregister device.');
    }
}

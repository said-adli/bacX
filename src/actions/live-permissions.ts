"use server";

import { RoomServiceClient } from 'livekit-server-sdk';
import { createClient } from "@/utils/supabase/server";

const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
const apiKey = process.env.LIVEKIT_API_KEY || "";
const apiSecret = process.env.LIVEKIT_API_SECRET || "";

const roomService = new RoomServiceClient(livekitUrl, apiKey, apiSecret);

export async function grantStageAccess(roomName: string, identity: string) {
    const supabase = await createClient();

    // 1. Authenticate & Authorize Admin
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        throw new Error("Forbidden: Admin access required");
    }

    // 2. Grant Permission via LiveKit API
    try {
        await roomService.updateParticipant(roomName, identity, undefined, {
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to grant stage access:", e);
        return { success: false, error: "Failed to update permissions" };
    }
}

export async function denyStageAccess(roomName: string, identity: string) {
    const supabase = await createClient();

    // 1. Authenticate & Authorize Admin
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        throw new Error("Forbidden: Admin access required");
    }

    // 2. Revoke Permission
    try {
        await roomService.updateParticipant(roomName, identity, undefined, {
            canPublish: false,
            canPublishData: true, // Keep data for raising hand
            canSubscribe: true,
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to deny stage access:", e);
        return { success: false, error: "Failed to update permissions" };
    }
}

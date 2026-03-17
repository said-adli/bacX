import { AccessToken, TrackSource } from 'livekit-server-sdk';

interface TokenOptions {
    userId: string;
    participantName: string;
    roomName: string;
    isAdmin: boolean;
}

export async function generateSecureToken({ userId, participantName, roomName, isAdmin }: TokenOptions) {
    const apiKey = (process.env.LIVEKIT_API_KEY || "").trim();
    const apiSecret = (process.env.LIVEKIT_API_SECRET || "").trim();

    if (!apiKey || !apiSecret) {
        throw new Error("LiveKit Server Misconfigured");
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: userId,
        name: participantName,
        ttl: 3600, // 1 hour explicit TTL to avoid clock skew issues
    });

    /**
     * SECURITY ENFORCEMENT
     * 1. Students (non-admins) NEVER get publish permissions by default.
     * 2. Hand Raising is allowed via Data Publishing.
     * 3. Video/Audio publishing requires server-side grant (RoomService).
     */

    // Combine all grants into a single addGrant call to avoid overwriting properties
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: isAdmin, // Only admins can publish audio starting out
        canSubscribe: true,
        canPublishData: true, // Needed for raising hand
        hidden: false,
        ...(isAdmin ? {
            canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE]
        } : {})
    });

    return await at.toJwt();
}

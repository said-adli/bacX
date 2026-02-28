import { AccessToken, TrackSource } from 'livekit-server-sdk';

interface TokenOptions {
    userId: string;
    participantName: string;
    roomName: string;
    isAdmin: boolean;
}

export async function generateSecureToken({ userId, participantName, roomName, isAdmin }: TokenOptions) {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
        throw new Error("LiveKit Server Misconfigured");
    }

    const at = new AccessToken(apiKey, apiSecret, {
        identity: userId,
        name: participantName,
    });

    /**
     * SECURITY ENFORCEMENT
     * 1. Students (non-admins) NEVER get publish permissions by default.
     * 2. Hand Raising is allowed via Data Publishing.
     * 3. Video/Audio publishing requires server-side grant (RoomService).
     */

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: false, // DEFAULT: FALSE for everyone (even admin starts disconnected? No, Admin should usually publish).
        // Update: Admin should be able to publish immediately if they are the host.
        // But for consistency, maybe Admin gets true?
        // Usage in route.ts had: canPublish: isAdmin
        // Usage in live.ts had: canPublish: false (my edit).
        // Let's stick to the rule: "No student should EVER receive a token with publish permissions".
        // Admin IS allowed.
        canSubscribe: true,
        canPublishData: true, // For Signals
        hidden: false,
    });

    // We augment the grant for Admins specifically if needed, OR we rely on grantStageAccess for everyone?
    // Usually Admins want to just join and talk.
    // So if isAdmin, we set canPublish: true.

    if (isAdmin) {
        at.addGrant({
            canPublish: true,
            canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE],
        });
    }

    return await at.toJwt();
}

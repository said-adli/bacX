"use server";

import { createClient } from "@/utils/supabase/server";
import { AccessToken } from 'livekit-server-sdk';

interface SecureLiveSession {
    authorized: boolean;
    error?: string;
    youtubeId?: string;
    liveToken?: string;
    isLive?: boolean;
    title?: string;
    user?: {
        name: string;
        id: string;
    };
}

export async function getHybridLiveSession(): Promise<SecureLiveSession> {
    const supabase = await createClient();

    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { authorized: false, error: "Authentication required" };
    }

    // 2. Authorization (DB Check)
    // Fetch profile to check subscription status
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, subscription_plans(*)')
        .eq('id', user.id)
        .single();

    if (!profile) return { authorized: false, error: "Profile not found" };

    const isAdmin = profile.role === 'admin' || profile.role === 'teacher';
    const isSubscribed = profile.is_subscribed === true;

    if (!isAdmin && !isSubscribed) {
        return { authorized: false, error: "Active subscription required" };
    }

    // 3. Fetch Live Session Data (Securely)
    // We only fetch based on new constraints.
    const { data: session, error: sessionError } = await supabase
        .from('live_sessions')
        .select('*, required_plan_id, published')
        .or('status.eq.live,status.eq.scheduled')
        .eq('published', true) // Must be published
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (sessionError) {
        console.error("Live fetch error", sessionError);
        return { authorized: false, error: "Could not fetch session data" };
    }

    // Force Check: Even if DB returned it, we double check plan match in code
    if (session && session.required_plan_id && !isAdmin) {
        if (profile.plan_id !== session.required_plan_id) {
            // Silent fail or explicit error?
            // Since we filtered for 'published', getting here means it exists.
            // But if RLS works, we wouldn't see it if we didn't match plan.
            // However, let's be redundant.
            return { authorized: false, error: "Plan mismatch" };
        }
    }

    if (!session) {
        return { authorized: true, isLive: false }; // User is auth'd, but no session active
    }

    // 4. Generate LiveKit Token (Audio Only)
    const roomName = "class_room_main"; // Or use session.id if dynamic
    const participantName = profile.full_name || user.email || "User";

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    let liveToken = "";

    if (apiKey && apiSecret) {
        try {
            const at = new AccessToken(apiKey, apiSecret, {
                identity: user.id,
                name: participantName,
            });

            at.addGrant({
                roomJoin: true,
                room: roomName,
                canPublish: true, // Audio permission
                canSubscribe: true,
                canPublishData: true,
            });

            liveToken = await at.toJwt();
        } catch (e) {
            console.error("LiveKit Token Gen Error", e);
            // Don't block video if audio fails
        }
    }

    // 5. Return Secure Payload
    return {
        authorized: true,
        youtubeId: session.youtube_id,
        isLive: session.status === 'live',
        title: session.title,
        liveToken,
        user: {
            id: user.id,
            name: participantName
        }
    };
}

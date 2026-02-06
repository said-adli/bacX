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

    // 4. Unified Access Control
    if (session) {
        // Fetch Ownership
        const { data: ownership } = await supabase
            .from('user_content_ownership')
            .select('content_id')
            .eq('user_id', user.id)
            .eq('content_id', session.id)
            .maybeSingle();

        const ownedContentIds = ownership ? [ownership.content_id] : [];

        // Construct ContentRequirement object
        const contentRequirement = {
            id: session.id,
            required_plan_id: session.required_plan_id,
            published: session.published ?? true, // Default to true if not present, but query requires it
            is_free: false // Live sessions are generally not free unless specified
        };

        // Use shared utility
        const { verifyContentAccess } = await import("@/lib/access-control");
        const access = await verifyContentAccess({
            ...profile,
            owned_content_ids: ownedContentIds
        }, contentRequirement);

        if (!access.allowed) {
            // Map reason to user-friendly error
            let errorMsg = "Access Denied";
            if (access.reason === 'subscription_required') errorMsg = "Active subscription required";
            if (access.reason === 'plan_mismatch') errorMsg = "Plan mismatch";

            return { authorized: false, error: errorMsg };
        }
    }

    if (!session) {
        // If no session, but user is authorized (authenticated + checked profile), we return authorized=true but isLive=false
        // Wait, the previous logic allowed "authorized: true" if no session existed? 
        // "return { authorized: true, isLive: false }; // User is auth'd, but no session active"
        // Yes, this is for showing the "No live session" UI state vs "Login required".
        return { authorized: true, isLive: false };
    }

    // 5. Generate LiveKit Token (Audio Only)
    const roomName = "class_room_main";
    const participantName = profile.full_name || user.email || "User";

    let liveToken = "";

    try {
        const { generateSecureToken } = await import("@/lib/livekit-token");
        const isAdmin = profile.role === 'admin' || profile.role === 'teacher';

        liveToken = await generateSecureToken({
            userId: user.id,
            participantName,
            roomName,
            isAdmin
        });
    } catch (e) {
        console.error("LiveKit Token Gen Error", e);
    }

    // 6. Return Secure Payload
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

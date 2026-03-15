"use server";

import { createClient } from "@/utils/supabase/server";

interface SecureLiveSession {
    authorized: boolean;
    error?: string;
    youtubeId?: string;
    liveToken?: string;
    livekitUrl?: string; // ADDED THIS
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
        .select('*, required_plan_id, is_active')
        .or('status.eq.live,status.eq.scheduled')
        .eq('is_active', true) // Must be active
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
            is_active: session.is_active ?? true,
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
    const roomName = session.id;
    const participantName = profile.full_name || user.email || "User";

    let liveToken = "";

    try {
        const { generateSecureToken } = await import("@/lib/livekit-token");
        const isAdmin = profile.role === 'admin' || profile.role === 'teacher';

        // SECRET VALIDATION LOGGING — helps diagnose 401 errors
        const hasKey = !!process.env.LIVEKIT_API_KEY;
        const hasSecret = !!process.env.LIVEKIT_API_SECRET;
        const hasUrl = !!process.env.NEXT_PUBLIC_LIVEKIT_URL;
        if (!hasKey || !hasSecret || !hasUrl) {
            console.error("[LiveKit Config Audit] MISSING ENV VARS:", {
                LIVEKIT_API_KEY: hasKey ? "✓ SET" : "✗ UNDEFINED",
                LIVEKIT_API_SECRET: hasSecret ? "✓ SET" : "✗ UNDEFINED",
                NEXT_PUBLIC_LIVEKIT_URL: hasUrl ? "✓ SET" : "✗ UNDEFINED",
            });
        }

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
        livekitUrl: (process.env.NEXT_PUBLIC_LIVEKIT_URL || "").trim(),
        user: {
            id: user.id,
            name: participantName
        }
    };
}

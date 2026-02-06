import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, TrackSource } from 'livekit-server-sdk';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const roomName = searchParams.get('room');

    if (!roomName) {
        return NextResponse.json({ error: 'Missing room parameter' }, { status: 400 });
    }

    // 1. Authenticate with Supabase
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch User Profile for Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 3. Create Access Token
    // Identity: use user ID
    // Name: use full name or email
    const participantName = profile?.full_name || user.email || 'User';

    const at = new AccessToken(apiKey, apiSecret, {
        identity: user.id,
        name: participantName,
    });

    // 4. Set Permissions & Unified Access Control
    // ACL: Validate access to the room
    const isAdmin = profile?.role === 'admin' || profile?.role === 'teacher';

    if (!isAdmin) {
        // Determine if this is a Live Session or a Lesson
        // We first try to find a Live Session with this ID
        const { data: liveSession } = await supabase
            .from('live_sessions')
            .select('required_plan_id, published')
            .eq('id', roomName)
            .maybeSingle();

        let contentRequirement;

        if (liveSession) {
            // It's a Live Session
            contentRequirement = {
                required_plan_id: liveSession.required_plan_id,
                published: liveSession.published ?? true,
                is_free: false // Live sessions are premium usually
            };
        } else {
            // Check if it's a Lesson
            const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .select('required_plan_id, is_free, units(subjects(published))')
                .eq('id', roomName)
                .single();

            if (lessonError || !lesson) {
                return NextResponse.json({ error: 'Room access denied or not found' }, { status: 403 });
            }

            // Safe access for deep join
            // units is likely an array, safeguard access
            // @ts-ignore
            const units = Array.isArray(lesson.units) ? lesson.units[0] : lesson.units;
            // @ts-ignore
            const subjects = Array.isArray(units?.subjects) ? units.subjects[0] : units?.subjects;
            const subjectPublished = subjects?.published;

            contentRequirement = {
                required_plan_id: lesson.required_plan_id,
                is_free: lesson.is_free,
                published: subjectPublished ?? true
            };
        }

        // UNIFIED CHECK
        const { verifyContentAccess } = await import("@/lib/access-control");
        const access = await verifyContentAccess(profile, contentRequirement);

        if (!access.allowed) {
            return NextResponse.json({ error: access.reason || 'Access Denied' }, { status: 403 });
        }
    }

    // Hardened Permissions: AUDIO ONLY (Signaling Purity)
    // We strictly limit the user to only publishing audio (hand-raising/talking).
    // No Video Publishing allowed for anyone (even admin? Maybe admin can, but let's stick to "Signalling Purity").
    // If Admin needs video, we might relax it, but the mission says "LiveKit is ONLY for interactivity".

    const canPublish = isAdmin; // Only admins can publish fully if needed, OR false for everyone if strict.
    // "Students should NEVER be able to publish audio/video." => canPublish = false (for students)

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: isAdmin, // Students: false, Admin: true
        canSubscribe: true,
        canPublishData: true, // Hand raising
        canPublishSources: isAdmin ? [TrackSource.CAMERA, TrackSource.MICROPHONE] : [], // Students: []
        hidden: false,
    });

    // Generate the JWT
    const token = await at.toJwt();

    return NextResponse.json({ token });
}

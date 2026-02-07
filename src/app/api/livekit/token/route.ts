import { NextRequest, NextResponse } from 'next/server';
import { TrackSource } from 'livekit-server-sdk';
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
            // Safe access for deep join
            // units is likely an array, safeguard access
            interface UnitWithSubject { subjects: { published: boolean } | { published: boolean }[] | null }
            const units = (Array.isArray(lesson.units) ? lesson.units[0] : lesson.units) as unknown as UnitWithSubject;

            const subjectData = units?.subjects;
            const subject = Array.isArray(subjectData) ? subjectData[0] : subjectData;
            const subjectPublished = subject?.published;

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

    // Hardened Permissions: Consolidate Logic
    const { generateSecureToken } = await import("@/lib/livekit-token");

    const token = await generateSecureToken({
        userId: user.id,
        participantName,
        roomName,
        isAdmin
    });

    return NextResponse.json({ token });
}

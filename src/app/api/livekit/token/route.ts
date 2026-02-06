import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
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

    // 4. Set Permissions
    // ACL: Validate access to the room
    const isAdmin = profile?.role === 'admin' || profile?.role === 'teacher';

    if (!isAdmin) {
        // Determine if this is a Live Session or a Lesson
        // We first try to find a Live Session with this ID (assuming roomName matches ID)

        // Check Live Session
        const { data: liveSession } = await supabase
            .from('live_sessions')
            .select('required_plan_id, published')
            .eq('id', roomName)
            // Room name for live is usually the ID or "class_room_main" (legacy)
            // If roomName is "class_room_main", we might need to fetch the *active* session.
            // But for RLS security, we should ideally use IDs. 
            // If legacy "class_room_main" is used, we need to find the CURRENT live session.
            // For now, let's assume roomName IS the session ID or strictly mapped.
            .maybeSingle();

        if (liveSession) {
            // It's a Live Session
            if (liveSession.published === false) {
                return NextResponse.json({ error: 'Session is not published' }, { status: 403 });
            }
            if (liveSession.required_plan_id) {
                if (!profile?.is_subscribed || profile?.plan_id !== liveSession.required_plan_id) {
                    return NextResponse.json({ error: 'Plan mismatch for live session' }, { status: 403 });
                }
            }
        } else {
            // It's likely a Lesson (or invalid)
            const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .select('required_plan_id')
                .eq('id', roomName)
                .single();

            if (lessonError || !lesson) {
                return NextResponse.json({ error: 'Room access denied or not found' }, { status: 403 });
            }

            // Lesson Checks
            if (lesson.required_plan_id) {
                if (profile?.active_plan_id !== lesson.required_plan_id) {
                    return NextResponse.json({ error: 'Active subscription required to join this room' }, { status: 403 });
                }
            }
        }
    }

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true, // Both teacher and student need to speak
        canSubscribe: true,
        canPublishData: true,
    });

    // Generate the JWT
    const token = await at.toJwt();

    return NextResponse.json({ token });
}

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
    // Default Rule: "class_room_main" requires active subscription
    const isMainRoom = roomName === 'class_room_main';
    const isAdmin = profile?.role === 'admin' || profile?.role === 'teacher';
    const isSubscribed = profile?.is_subscribed === true;

    if (isMainRoom && !isAdmin && !isSubscribed) {
        return NextResponse.json({ error: 'Subscription required to join this room' }, { status: 403 });
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

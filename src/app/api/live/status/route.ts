import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // Ensures headers are respected dynamically

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("live_sessions")
            .select("id, title, status, started_at, viewer_count, youtube_id")
            .or("status.eq.live,status.eq.scheduled")
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Live status Edge API error:", error);
            return NextResponse.json(
                { liveSession: null },
                {
                    status: 200,
                    headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=10' }
                }
            );
        }

        return NextResponse.json(
            { liveSession: data || null },
            {
                status: 200,
                headers: {
                    // Cache at Vercel Edge for 30 seconds. Serve stale payload for up to 30 additional seconds while revalidating in background.
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30'
                }
            }
        );
    } catch (e) {
        console.error("Live endpoint fatal error:", e);
        return NextResponse.json({ liveSession: null }, { status: 500 });
    }
}

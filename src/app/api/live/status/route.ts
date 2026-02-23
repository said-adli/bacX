import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic'; // Ensures headers are respected dynamically

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("live_sessions")
            .select("id, title, status, started_at, viewer_count, youtube_id")
            .or("status.eq.live,status.eq.scheduled")
            .order("started_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        const isFast = request.nextUrl.searchParams.get('fast') === 'true';
        const headers: HeadersInit = isFast
            ? { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
            : { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=30' };

        if (error) {
            console.error("Live status Edge API error:", error);
            return NextResponse.json(
                { liveSession: null },
                {
                    status: 200,
                    headers: isFast ? headers : { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=10' }
                }
            );
        }

        return NextResponse.json(
            { liveSession: data || null },
            {
                status: 200,
                headers
            }
        );
    } catch (e) {
        console.error("Live endpoint fatal error:", e);
        return NextResponse.json({ liveSession: null }, { status: 500 });
    }
}

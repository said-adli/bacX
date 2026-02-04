"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface LiveSession {
    id: string;
    title: string;
    status: "scheduled" | "live" | "ended";
    started_at: string | null;
    viewer_count: number;
    youtube_id: string | null;
}

export function useLiveStatus() {
    const supabase = createClient();
    const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // 1. Initial Fetch
        const fetchLive = async () => {
            try {
                const { data, error } = await supabase
                    .from("live_sessions")
                    .select("*")
                    .or("status.eq.live,status.eq.scheduled")
                    .order("started_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) throw error; // Now we catch it

                if (isMounted) {
                    if (data) {
                        setLiveSession(data as LiveSession);
                    } else {
                        setLiveSession(null);
                    }
                }
            } catch (err) {
                // Sentry.captureException(err); // TODO: Uncomment when Sentry is configured
                console.error("Error fetching live session [Handled]:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLive();

        // 2. Realtime Subscription
        const channel = supabase
            .channel('public:live_sessions')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'live_sessions'
                },
                (payload: RealtimePostgresChangesPayload<LiveSession>) => {
                    // Refresh data on any change (simple approach) or handle payload
                    // For simplicity, we just refetch or inspect the payload
                    if (payload.eventType === 'DELETE') {
                        setLiveSession(null);
                    } else {
                        setLiveSession(payload.new as LiveSession);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []); // Removed supabase from deps - it's recreated each render

    const isLive = liveSession?.status === "live";
    const title = liveSession?.title || "";
    const youtubeId = liveSession?.youtube_id || "";

    return {
        liveSession,
        loading,
        isLive,
        title,
        youtubeId
    };
}

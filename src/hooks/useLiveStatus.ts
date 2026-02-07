"use client";

import { useEffect, useState, useMemo } from "react";
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
    const supabase = useMemo(() => createClient(), []);
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
                console.error("Error fetching live session [Handled]:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLive();

        // 2. Polling (Adaptive: 30s active, 5min background)
        const poll = async () => {
            if (!isMounted) return;

            // Background check
            if (document.hidden) {
                // Slower polling or stop? Req says: "Stop polling on hidden tab" for some, "60-120s" for others.
                // Scenario A says "60-120s only when visible" (wait, scenario A was admin/system). 
                // This hook seems generally used. Let's do 60s.
                return;
            }

            await fetchLive();
        };

        const intervalId = setInterval(poll, 30000); // 30s polling when visible

        // Re-fetch on focus
        const onFocus = () => fetchLive();
        window.addEventListener('focus', onFocus);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
        };
    }, [supabase]);

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

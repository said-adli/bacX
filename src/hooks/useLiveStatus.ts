"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";


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
                console.error("Error fetching live session [Handled]:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLive();

        // 2. Visibility-aware polling (30s active, paused when hidden)
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            if (intervalId) return;
            intervalId = setInterval(() => {
                if (!isMounted) return;
                fetchLive();
            }, 30000);
        };

        const stopPolling = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                fetchLive(); // Immediate refresh on return
                startPolling();
            }
        };

        // Start polling only if visible
        if (!document.hidden) {
            startPolling();
        }

        document.addEventListener('visibilitychange', onVisibilityChange);

        // Re-fetch on focus
        const onFocus = () => fetchLive();
        window.addEventListener('focus', onFocus);

        return () => {
            isMounted = false;
            stopPolling();
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

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

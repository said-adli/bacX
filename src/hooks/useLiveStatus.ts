"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export interface LiveSession {
    id: string;
    title: string;
    status: "scheduled" | "live" | "ended";
    started_at: string | null;
    viewer_count: number;
    youtube_id: string | null;
}

export function useLiveStatus() {
    const pathname = usePathname();
    const isFastPoll = pathname === '/live' || pathname?.startsWith('/materials');
    const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        if (process.env.NODE_ENV === 'development') {
            console.log(`[LiveStatus] Polling mode: ${isFastPoll ? 'FAST' : 'NORMAL'}`);
        }

        // 1. Initial Fetch
        const fetchLive = async () => {
            try {
                const url = isFastPoll ? '/api/live/status?fast=true' : '/api/live/status';
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch live API");
                const { liveSession: data } = await response.json();

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

        // 2. Visibility-aware polling (60s active, paused when hidden)
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const startPolling = () => {
            if (intervalId) return;
            intervalId = setInterval(() => {
                if (!isMounted) return;
                fetchLive();
            }, isFastPoll ? 10000 : 60000);
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
    }, [pathname, isFastPoll]);

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

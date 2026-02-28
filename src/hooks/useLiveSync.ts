"use client";

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseLiveSyncProps {
    currentTime: number;
    duration: number;
    isLive: boolean;
    onSeek: (time: number) => void;
    threshold?: number; // Seconds allowable behind live edge (prevent jitter)
    targetBuffer?: number; // Seconds to keep as buffer (seek to duration - buffer)
}

export function useLiveSync({
    currentTime,
    duration,
    isLive,
    onSeek,
    threshold = 10,     // Allow 10s drift before forcing sync
    targetBuffer = 3    // Aim for 3s behind live edge (safe buffer)
}: UseLiveSyncProps) {
    const lastSyncTime = useRef<number>(0);

    useEffect(() => {
        if (!isLive || duration === 0 || currentTime === 0) return;

        // Calculate "Live Edge" Gap
        // In YouTube Live, 'duration' is usually the Live Head.
        const drift = duration - currentTime;

        // Debounce syncs (don't sync more than once every 10s)
        const now = Date.now();
        if (now - lastSyncTime.current < 10000) return;

        // Check if we fell behind
        if (drift > threshold) {
            // Drift detected, syncing...

            const targetTime = duration - targetBuffer;
            onSeek(targetTime);

            lastSyncTime.current = now;
            toast.success("⚡ Synced to Live", {
                description: "Recovered efficient low-latency connection",
                duration: 2000,
            });
        }
    }, [currentTime, duration, isLive, threshold, targetBuffer, onSeek]);
}

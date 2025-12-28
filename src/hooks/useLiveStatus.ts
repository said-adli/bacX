import { useState, useEffect } from "react";
import { doc, onSnapshot, Timestamp, FirestoreError } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveStatus {
    isLive: boolean;
    youtubeId: string;
    title: string;
    startedAt?: Timestamp | null;
}

export function useLiveStatus() {
    const [status, setStatus] = useState<LiveStatus>({
        isLive: false,
        youtubeId: "",
        title: "",
        startedAt: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Listen to Public Config (Always Allowed)
        const unsubConfig = onSnapshot(doc(db, "config", "live_stream"), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setStatus(prev => ({ ...prev, ...(data as Partial<LiveStatus>) }));

                // If not live, clear ID immediately
                if (!data.isLive) {
                    setStatus(prev => ({ ...prev, youtubeId: "" }));
                }
            } else {
                setStatus({ isLive: false, youtubeId: "", title: "", startedAt: null });
            }
            setLoading(false);
        });

        // 2. Listen to Secret Stream (Protected - will fail if not subscribed)
        // We use a separate listener so the public data doesn't get blocked by the private error
        const unsubSecret = onSnapshot(doc(db, "secret_stream", "current"),
            (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setStatus((prev: LiveStatus) => ({ ...prev, youtubeId: data.youtubeId || "" }));
                }
            },
            (error: FirestoreError) => {
                // Permission Denied or Not Logged In - Expected for free users
                // Just verify we don't have a stale ID
                if (error.code === 'permission-denied') {
                    console.log("Stream is protected. Upgrade to view.");
                } else {
                    console.error("Secret stream error:", error);
                }
            }
        );

        return () => {
            unsubConfig();
            unsubSecret();
        };
    }, []);

    return { ...status, loading };
}

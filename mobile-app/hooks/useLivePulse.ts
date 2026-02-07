import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';

/**
 * useLivePulse Hook
 * Real-time listener for live stream status
 * Mirrors web's useLiveStatus from src/hooks/useLiveStatus.ts
 * 
 * Listens to: config/live_stream
 * Returns: { isLive, title, subject, loading }
 */

interface LivePulseState {
    isLive: boolean;
    title: string;
    subject: string;
    startedAt: Date | null;
}

interface UseLivePulseReturn extends LivePulseState {
    loading: boolean;
}

export function useLivePulse(): UseLivePulseReturn {
    const [state, setState] = useState<LivePulseState>({
        isLive: false,
        title: '',
        subject: '',
        startedAt: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to public config (always readable)
        const unsubscribe = db
            .collection('config')
            .doc('live_stream')
            .onSnapshot(
                (docSnapshot) => {
                    if (docSnapshot.exists) {
                        const data = docSnapshot.data();
                        setState({
                            isLive: data?.isLive ?? false,
                            title: data?.title ?? '',
                            subject: data?.subject ?? '',
                            startedAt: data?.startedAt?.toDate() ?? null,
                        });
                    } else {
                        setState({
                            isLive: false,
                            title: '',
                            subject: '',
                            startedAt: null,
                        });
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error('Live pulse listener error:', error);
                    setLoading(false);
                }
            );

        return () => unsubscribe();
    }, []);

    return { ...state, loading };
}

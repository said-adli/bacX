import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type InteractionStatus = 'waiting' | 'live' | 'ended' | 'idle';

export interface LiveInteraction {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    status: InteractionStatus;
    peer_id: string; // Kept for DB schema compatibility, but unused for audio
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    role: 'student' | 'teacher' | 'admin';
    is_question: boolean;
    created_at: string;
    /** Message delivery status for optimistic UI */
    status?: 'pending' | 'sent' | 'failed';
}

export const useLiveInteraction = () => {
    const { user, profile } = useAuth();
    const supabase = createClient();

    // State
    const [status, setStatus] = useState<InteractionStatus>('idle');
    const [queue, setQueue] = useState<LiveInteraction[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [displayBuffer, setDisplayBuffer] = useState<ChatMessage[]>([]); // [NEW] Buffer
    const [currentSpeaker, setCurrentSpeaker] = useState<LiveInteraction | null>(null);

    // Refs
    const lastMessageTimeRef = useRef<number>(0);
    const displayedIdsRef = useRef<Set<string>>(new Set());

    // [NEW] Waterfall Effect
    useEffect(() => {
        if (displayBuffer.length === 0) return;

        const timer = setInterval(() => {
            setDisplayBuffer(prev => {
                const [next, ...rest] = prev;
                if (!next) return prev;

                setMessages(curr => {
                    if (displayedIdsRef.current.has(next.id)) return curr;
                    displayedIdsRef.current.add(next.id);
                    return [...curr, next];
                });
                return rest;
            });
        }, 400); // 400ms delay per message

        return () => clearInterval(timer);
    }, [displayBuffer]);


    // 1. Polling (Adaptive)
    useEffect(() => {
        let isMounted = true;
        let pollInterval = 5000; // Default 5s
        let intervalId: NodeJS.Timeout;

        const fetchState = async () => {
            if (!isMounted || document.hidden) return;

            const client = createClient();

            // A. Fetch Queue
            const { data: queueData } = await client.from('live_interactions')
                .select('*')
                .in('status', ['waiting', 'live'])
                .order('created_at', { ascending: true });

            if (queueData) {
                setQueue(queueData as LiveInteraction[]);
                const liveUser = (queueData as LiveInteraction[]).find(i => i.status === 'live');
                if (liveUser) setCurrentSpeaker(liveUser);

                if (liveUser && liveUser.user_id === user?.id) setStatus('live');
                else if (queueData.find((i: LiveInteraction) => i.user_id === user?.id && i.status === 'waiting')) setStatus('waiting');
            }

            // B. Fetch Messages (Chat)
            const { data: msgData } = await client.from('live_comments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (msgData) {
                const incoming = (msgData as ChatMessage[]).reverse();

                // Initial Load: Dump everything immediately if empty
                // But we need to use functional update to check 'messages' length if we want "Initial Load" logic?
                // Actually, checking displayedIdsRef is safer.

                // Note: 'incoming' is the last 50.

                if (displayedIdsRef.current.size === 0) {
                    // FIRST LOAD: Show immediately (UX)
                    const uniqueIncoming = incoming.filter(m => !displayedIdsRef.current.has(m.id));
                    uniqueIncoming.forEach(m => displayedIdsRef.current.add(m.id));
                    setMessages(uniqueIncoming);
                } else {
                    // UPDATE: Push to Buffer
                    setDisplayBuffer(prevBuffer => {
                        // Filter out what is already Displayed OR already in Buffer
                        const bufferIds = new Set(prevBuffer.map(b => b.id));
                        const newItems = incoming.filter(m =>
                            !displayedIdsRef.current.has(m.id) &&
                            !bufferIds.has(m.id)
                        );
                        return [...prevBuffer, ...newItems];
                    });
                }
            }
        };

        const runPoll = () => {
            fetchState();
            // Adaptive Logic
            if (document.hidden) {
                pollInterval = 60000; // 60s
            } else if (Date.now() - lastMessageTimeRef.current < 30000) {
                pollInterval = 3000; // 3s (Active)
            } else {
                pollInterval = 10000; // 10s (Idle)
            }

            // Re-schedule
            clearInterval(intervalId);
            intervalId = setInterval(runPoll, pollInterval);
        };

        runPoll(); // Initial

        // Visibility Handler
        const handleVisibilityValues = () => runPoll();
        document.addEventListener('visibilitychange', handleVisibilityValues);
        window.addEventListener('focus', handleVisibilityValues);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityValues);
            window.removeEventListener('focus', handleVisibilityValues);
        };
    }, [user, profile]);


    // ACTIONS

    // 💬 CHAT: Send via DB
    const sendMessage = async (content: string, isQuestion: boolean) => {
        if (!user) return;

        // THROTTLE: 500ms local check
        const now = Date.now();
        if (now - lastMessageTimeRef.current < 500) return;
        lastMessageTimeRef.current = now;

        const tempId = crypto.randomUUID();
        const msg: ChatMessage = {
            id: tempId,
            user_id: user.id,
            user_name: profile?.full_name || 'User',
            content,
            role: (profile?.role === 'admin') ? 'teacher' : 'student',
            is_question: isQuestion, // Note: DB column is snake_case 'is_question'
            created_at: new Date().toISOString()
        };

        // 1. Optimistic Update with pending status
        setMessages(prev => [...prev, { ...msg, status: 'pending' }]);

        // 2. Insert DB
        try {
            const { error } = await supabase.from('live_comments').insert({
                user_id: user.id,
                user_name: profile?.full_name || 'User',
                content,
                role: (profile?.role === 'admin') ? 'teacher' : 'student',
                is_question: isQuestion
            });

            if (error) {
                console.error("Failed to send message", error);
                // Mark as failed for UI feedback
                setMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: 'failed' as const } : m
                ));
            } else {
                // Mark as sent
                setMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, status: 'sent' as const } : m
                ));
            }
        } catch (e) {
            console.error("Send exception", e);
            setMessages(prev => prev.map(m =>
                m.id === tempId ? { ...m, status: 'failed' as const } : m
            ));
        }
    };

    const raiseHand = async () => {
        if (!user || status !== 'idle') return;
        try {
            setStatus('waiting');
            await supabase.from('live_interactions').insert({
                user_id: user.id,
                user_name: profile?.full_name || 'Anonymous',
                peer_id: 'livekit',
                status: 'waiting'
            });
        } catch (error) {
            setStatus('idle');
            alert("Failed to join queue.");
        }
    };

    // TEACHER: Lower All Hands (RPC)
    const lowerAllHands = async () => {
        try {
            const { error } = await supabase.rpc('lower_all_hands');
            if (error) throw error;
        } catch (e) {
            console.error("Failed to lower all hands:", e);
            alert("Failed to clear queue");
        }
    }

    const acceptStudent = async (studentInteraction: LiveInteraction) => {
        try {
            await supabase.from('live_interactions').update({ status: 'live' }).eq('id', studentInteraction.id);
            setCurrentSpeaker(studentInteraction);
        } catch (e) { console.error("Error accepting", e); }
    };

    const endCall = async () => {
        if (currentSpeaker) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('id', currentSpeaker.id);
        } else if (status === 'waiting' && user) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('user_id', user.id).eq('status', 'waiting');
        } else if (status === 'live' && user) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('user_id', user.id).eq('status', 'live');
        }

        setStatus('idle');
        setCurrentSpeaker(null);
    };

    return {
        status,
        queue,
        messages,
        sendMessage,
        currentSpeaker,
        raiseHand,
        acceptStudent,
        lowerAllHands,
        endCall,
    };
};

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
}

export const useLiveInteraction = () => {
    const { user, profile } = useAuth();
    const supabase = createClient();

    // State
    const [status, setStatus] = useState<InteractionStatus>('idle');
    const [queue, setQueue] = useState<LiveInteraction[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentSpeaker, setCurrentSpeaker] = useState<LiveInteraction | null>(null);

    // Refs
    const lastMessageTimeRef = useRef<number>(0);
    const channelRef = useRef<any>(null);

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
            // Limit to last 50 for performance
            const { data: msgData } = await client.from('live_comments')
                .select('*')
                .order('created_at', { ascending: true }) // Oldest first for chat flow? Or newest? Chat usually appends.
                // Actually usually we fetch last N. 
                // .order('created_at', { ascending: false }).limit(50) -> then reverse?
                // Let's do simple ascending for now, assuming we want historically consistent chat.
                // Optimization: Filter by `created_at` > `lastLoadedTime` to only append?
                // For simplicity in this refactor, we replace the list (or we could merge).
                // Replacing helps with deletions/moderation.
                .order('created_at', { ascending: false })
                .limit(50);

            if (msgData) {
                // DB is snake_case. Interface is camelCase (is_question vs is_question? No, interface says is_question: boolean in Step 76, 
                // wait. Step 76 interface: is_question: boolean. DB: is_question. 
                // Check Step 101: `const { data: msgData}`
                // I need to confirm interface keys match DB keys or map them.
                // Step 76:
                // export interface ChatMessage { ... is_question: boolean; ... }
                // Migration: is_question BOOLEAN
                // So keys match. I can just cast.
                setMessages((msgData as ChatMessage[]).reverse());
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

        // 1. Optimistic Update
        setMessages(prev => [...prev, msg]);

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
                // Rollback? Or show error state?
                // For 'Production Refactor', maybe mark as failed.
                // setMessages(prev => prev.map(m => m.id === tempId ? { ...m, failed: true } : m));
            }
        } catch (e) {
            console.error("Send exception", e);
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

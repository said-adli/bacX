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

    // 1. Realtime Subscription (DB Hands + Broadcast Chat)
    useEffect(() => {
        const client = createClient();

        // Fetch Initial Queue (DB)
        const fetchQueue = async () => {
            const { data } = await client.from('live_interactions')
                .select('*')
                .in('status', ['waiting', 'live'])
                .order('created_at', { ascending: true });

            if (data) {
                setQueue(data as LiveInteraction[]);
                const liveUser = (data as LiveInteraction[]).find(i => i.status === 'live');
                if (liveUser) setCurrentSpeaker(liveUser);

                if (liveUser && liveUser.user_id === user?.id) setStatus('live');
                else if (data.find((i: LiveInteraction) => i.user_id === user?.id && i.status === 'waiting')) setStatus('waiting');
            }
        };

        fetchQueue();

        // Subscribe
        const channel = client.channel('live_room_global')
            // A. LISTEN: DB Changes for Queue
            .on('postgres_changes', { event: '*', schema: 'public', table: 'live_interactions' }, () => {
                fetchQueue();
            })
            // B. LISTEN: Broadcast for Chat
            .on('broadcast', { event: 'chat' }, (payload: { payload: ChatMessage }) => {
                const newMsg = payload.payload;
                setMessages(prev => [...prev, newMsg]);
            })
            .subscribe((status: string) => {
                if (status === 'SUBSCRIBED') {
                    channelRef.current = channel;
                }
            });

        return () => {
            client.removeChannel(channel);
            channelRef.current = null;
        };
    }, [user, profile]);


    // ACTIONS

    // 💬 CHAT: Send via Broadcast (Ephemeral)
    const sendMessage = async (content: string, isQuestion: boolean) => {
        if (!user || !channelRef.current) return;

        // THROTTLE: 500ms
        const now = Date.now();
        if (now - lastMessageTimeRef.current < 500) {
            console.warn("Chat throttled");
            return;
        }
        lastMessageTimeRef.current = now;

        const msg: ChatMessage = {
            id: crypto.randomUUID(),
            user_id: user.id,
            user_name: profile?.full_name || 'User',
            content,
            role: (profile?.role === 'admin') ? 'teacher' : 'student',
            is_question: isQuestion,
            created_at: new Date().toISOString()
        };

        // 1. Optimistic Update (Show my own message immediately)
        setMessages(prev => [...prev, msg]);

        // 2. Send to others
        await channelRef.current.send({
            type: 'broadcast',
            event: 'chat',
            payload: msg
        });
    };

    const raiseHand = async () => {
        if (!user || status !== 'idle') return;
        try {
            setStatus('waiting');
            await supabase.from('live_interactions').insert({
                user_id: user.id,
                user_name: profile?.full_name || 'Anonymous',
                peer_id: 'livekit', // Placeholder
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
            // Just update DB. The LiveKit component will react to the status change.
            await supabase.from('live_interactions').update({ status: 'live' }).eq('id', studentInteraction.id);
            setCurrentSpeaker(studentInteraction);
        } catch (e) { console.error("Error accepting", e); }
    };

    const endCall = async () => {
        // 1. Cleanup DB
        if (currentSpeaker) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('id', currentSpeaker.id);
        } else if (status === 'waiting' && user) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('user_id', user.id).eq('status', 'waiting');
        } else if (status === 'live' && user) {
            // If I am the student ending the call
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

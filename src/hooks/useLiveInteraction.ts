import { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { chatStore } from '@/lib/chat-store';
import type { InteractionStatus, LiveInteraction, ChatMessage } from '@/lib/chat-store';

export type { InteractionStatus, LiveInteraction, ChatMessage };

export const useLiveInteraction = () => {
    const { user, profile } = useAuth();
    const supabase = createClient();

    // Subscribe to Store
    const storeState = useSyncExternalStore(
        (cb) => chatStore.subscribe(cb),
        () => chatStore.getSnapshot()
    );

    // Refs for polling logic (keeping local refs for things that don't need UI updates or are for polling control)
    const lastMessageTimeRef = useRef<number>(0);

    // 1. Polling (Adaptive)
    useEffect(() => {
        let isMounted = true;
        let pollInterval = 5000;
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
                const q = queueData as LiveInteraction[];
                chatStore.setQueue(q);

                const liveUser = q.find(i => i.status === 'live');
                if (liveUser) chatStore.setCurrentSpeaker(liveUser);
                else chatStore.setCurrentSpeaker(null);

                // Update Status based on User
                if (liveUser && liveUser.user_id === user?.id) chatStore.setStatus('live');
                else if (q.find(i => i.user_id === user?.id && i.status === 'waiting')) chatStore.setStatus('waiting');
                else if (chatStore.getSnapshot().status !== 'idle' && !liveUser && !q.find(i => i.user_id === user?.id)) {
                    // Check if we were kicked/ended
                    chatStore.setStatus('idle');
                }
            }

            // B. Fetch Messages (Chat)
            const { data: msgData } = await client.from('live_comments')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (msgData) {
                const incoming = (msgData as ChatMessage[]).reverse();
                chatStore.ingestMessages(incoming);
            }
        };

        const runPoll = () => {
            fetchState();
            // Adaptive Logic
            if (document.hidden) {
                pollInterval = 60000;
            } else if (Date.now() - lastMessageTimeRef.current < 30000) {
                pollInterval = 3000;
            } else {
                pollInterval = 10000;
            }

            clearInterval(intervalId);
            intervalId = setInterval(runPoll, pollInterval);
        };

        runPoll();

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

    const sendMessage = async (content: string, isQuestion: boolean) => {
        if (!user) return;

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
            is_question: isQuestion,
            created_at: new Date().toISOString(),
            status: 'pending'
        };

        // 1. Optimistic Update
        chatStore.addOptimisticMessage(msg);

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
                chatStore.updateMessageStatus(tempId, 'failed');
            } else {
                chatStore.updateMessageStatus(tempId, 'sent');
            }
        } catch (e) {
            console.error("Send exception", e);
            chatStore.updateMessageStatus(tempId, 'failed');
        }
    };

    const raiseHand = async () => {
        if (!user || chatStore.getSnapshot().status !== 'idle') return;
        try {
            chatStore.setStatus('waiting');
            await supabase.from('live_interactions').insert({
                user_id: user.id,
                user_name: profile?.full_name || 'Anonymous',
                peer_id: 'livekit',
                status: 'waiting'
            });
        } catch (error) {
            chatStore.setStatus('idle');
            alert("Failed to join queue.");
        }
    };

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
            chatStore.setCurrentSpeaker(studentInteraction);
        } catch (e) { console.error("Error accepting", e); }
    };

    const endCall = async () => {
        const currentSnapshot = chatStore.getSnapshot();
        if (currentSnapshot.currentSpeaker) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('id', currentSnapshot.currentSpeaker.id);
        } else if (currentSnapshot.status === 'waiting' && user) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('user_id', user.id).eq('status', 'waiting');
        } else if (currentSnapshot.status === 'live' && user) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('user_id', user.id).eq('status', 'live');
        }

        chatStore.setStatus('idle');
        chatStore.setCurrentSpeaker(null);
    };

    // Return the stable store state properties directly
    return {
        status: storeState.status,
        queue: storeState.queue,
        messages: storeState.messages,
        sendMessage,
        currentSpeaker: storeState.currentSpeaker,
        raiseHand,
        acceptStudent,
        lowerAllHands,
        endCall,
    };
};

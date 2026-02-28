import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { chatStore } from '@/lib/chat-store';
import type { InteractionStatus, LiveInteraction, ChatMessage } from '@/lib/chat-store';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { RoomEvent, DataPacket_Kind, RemoteParticipant } from 'livekit-client';
import { grantStageAccess, denyStageAccess } from '@/actions/live-permissions';

export type { InteractionStatus, LiveInteraction, ChatMessage };

export const useLiveInteraction = () => {
    const { user, profile } = useAuth();
    const supabase = createClient();

    // LiveKit Context - MUST be called unconditionally at top level (Rules of Hooks)
    // These hooks will return undefined/null values if not inside LiveKitRoom
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();

    // Subscribe to Store
    const storeState = useSyncExternalStore(
        (cb) => chatStore.subscribe(cb),
        () => chatStore.getSnapshot()
    );

    const lastMessageTimeRef = useRef<number>(0);

    // 1. LIVEKIT SIGNAL LISTENERS (Data Packets)
    useEffect(() => {
        if (!room) return;

        const onData = (payload: Uint8Array, participant: RemoteParticipant | undefined, kind: DataPacket_Kind | undefined, topic?: string) => {
            const strData = new TextDecoder().decode(payload);

            if (topic === 'raise-hand') {
                try {
                    const data = JSON.parse(strData);
                    // Add to Queue (Ephemeral)
                    // We only "trust" signals?
                    // Ideally, we'd validate source.
                    const newInteraction: LiveInteraction = {
                        id: data.id,
                        user_id: data.user_id,
                        user_name: data.user_name,
                        status: 'waiting',
                        peer_id: participant?.identity || 'unknown',
                        created_at: data.created_at
                    };

                    // Simple Dedupe
                    const currentQ = chatStore.getSnapshot().queue;
                    if (!currentQ.find(i => i.user_id === newInteraction.user_id)) {
                        chatStore.setQueue([...currentQ, newInteraction]);
                    }
                } catch (e) { console.error("Bad packet", e); }
            }

            if (topic === 'lower-hand') {
                // Remove from queue
                try {
                    const data = JSON.parse(strData);
                    const currentQ = chatStore.getSnapshot().queue;
                    chatStore.setQueue(currentQ.filter(i => i.user_id !== data.user_id));
                } catch (e) { }
            }

            if (topic === 'queue-sync') {
                // Full queue sync from admin? (Optional)
            }
        };

        const onPermissionChange = () => {
            // Check if I can publish now
            if (localParticipant?.permissions?.canPublish) {
                chatStore.setStatus('live');
                // Create a fake interaction for self if missing?
                const me: LiveInteraction = {
                    id: 'self',
                    user_id: user?.id || 'me',
                    user_name: profile?.full_name || 'Me',
                    status: 'live',
                    peer_id: localParticipant.identity,
                    created_at: new Date().toISOString()
                };
                chatStore.setCurrentSpeaker(me);
            } else {
                if (chatStore.getSnapshot().status === 'live') {
                    chatStore.setStatus('idle');
                    chatStore.setCurrentSpeaker(null);
                }
            }
        };

        room.on(RoomEvent.DataReceived, onData);
        room.on(RoomEvent.ParticipantPermissionsChanged, onPermissionChange);

        // Initial Check
        if (localParticipant?.permissions?.canPublish) {
            chatStore.setStatus('live');
        }

        return () => {
            room.off(RoomEvent.DataReceived, onData);
            room.off(RoomEvent.ParticipantPermissionsChanged, onPermissionChange);
        };
    }, [room, localParticipant, user, profile]);


    // 2. SUPABASE CHAT POLLING (Keep specific parts)
    useEffect(() => {
        let isMounted = true;
        let pollInterval = 5000;
        let intervalId: NodeJS.Timeout;

        const fetchChat = async () => {
            // ... kept simple
            const { data: msgData } = await supabase.from('live_comments')
                .select('id, user_id, user_name, content, role, is_question, created_at, status')
                .order('created_at', { ascending: false })
                .limit(50);

            if (msgData) {
                const incoming = (msgData as ChatMessage[]).reverse();
                chatStore.ingestMessages(incoming);
            }
        };

        const runPoll = () => {
            fetchChat();
            if (document.hidden) pollInterval = 60000;
            else if (Date.now() - lastMessageTimeRef.current < 30000) pollInterval = 3000;
            else pollInterval = 10000;

            clearInterval(intervalId);
            intervalId = setInterval(runPoll, pollInterval);
        };

        runPoll();
        return () => { isMounted = false; clearInterval(intervalId); };
    }, [user]);


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

        chatStore.addOptimisticMessage(msg);

        try {
            const { error } = await supabase.from('live_comments').insert({
                user_id: user.id,
                user_name: profile?.full_name || 'User',
                content,
                role: (profile?.role === 'admin') ? 'teacher' : 'student',
                is_question: isQuestion
            });
            if (error) chatStore.updateMessageStatus(tempId, 'failed');
            else chatStore.updateMessageStatus(tempId, 'sent');
        } catch (e) { chatStore.updateMessageStatus(tempId, 'failed'); }
    };

    const raiseHand = async () => {
        if (!user || chatStore.getSnapshot().status !== 'idle' || !localParticipant) return;

        try {
            chatStore.setStatus('waiting');
            const data = {
                id: crypto.randomUUID(),
                user_id: user.id,
                user_name: profile?.full_name || 'Anonymous',
                created_at: new Date().toISOString()
            };
            const encoder = new TextEncoder();
            // Publish to topic 'raise-hand' with reliable delivery
            await localParticipant.publishData(encoder.encode(JSON.stringify(data)), {
                reliable: true,
                topic: 'raise-hand'
            });
        } catch (error) {
            console.error(error);
            chatStore.setStatus('idle');
            alert("Failed to raise hand.");
        }
    };

    const acceptStudent = async (studentInteraction: LiveInteraction) => {
        // SERVER ACTION
        try {
            await grantStageAccess(room.name, studentInteraction.peer_id || studentInteraction.user_id);
            // We assume identity == user_id. 
            // In AdminLiveClient we must ensure peer_id is correct. 
            // From signal, peer_id might be missing if we constructed it from JSON.
            // But usually identity = user_id.

            // Note: RoomServiceClient.updateParticipant takes 'identity'. 
            // Ensure studentInteraction.user_id IS the identity. 
            // In live.ts, identity: user.id. Correct.

            chatStore.setCurrentSpeaker(studentInteraction);
            // Remove from queue locally
            const currentQ = chatStore.getSnapshot().queue;
            chatStore.setQueue(currentQ.filter(i => i.id !== studentInteraction.id));
        } catch (e) { console.error("Error accepting", e); }
    };

    const endCall = async () => {
        // If I am the speaker (student), I can lower myself?
        // Or if I am admin, I end someone else.

        if (profile?.role === 'admin') {
            const speaker = chatStore.getSnapshot().currentSpeaker;
            if (speaker) {
                await denyStageAccess(room.name, speaker.user_id);
                chatStore.setCurrentSpeaker(null);
            }
        } else {
            // Student ending their own call?
            // Not really implemented in strict mode. Student just stops publishing?
            // But they can't revoke their own permission easily (client side).
            // They just mute?
            // Actually, if they click "End", they should signal 'leave-stage'?
            // Or we just unpublish tracks.
            // But valid permission remains. 
            // Ideally we call denyStageAccess too (but needs admin? No, we need a 'leaveStage' action for students?)
            // For now, assume Admin controls it.
        }

        // Also "Cancel Raise Hand"
        if (storeState.status === 'waiting') {
            chatStore.setStatus('idle');
            const data = { user_id: user?.id };
            const encoder = new TextEncoder();
            await localParticipant?.publishData(encoder.encode(JSON.stringify(data)), { reliable: true, topic: 'lower-hand' });
        }
    };

    const lowerAllHands = async () => {
        // Just clear local queue and send signal?
        chatStore.setQueue([]);
        // Send signal to all to clear?
        await localParticipant?.publishData(new TextEncoder().encode(JSON.stringify({})), { reliable: true, topic: 'lower-all' });
    };

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
        isConnected: !!room
    };
};

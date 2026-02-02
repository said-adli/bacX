import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Peer from 'peerjs';

export type InteractionStatus = 'waiting' | 'live' | 'ended' | 'idle';

export interface LiveInteraction {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    status: InteractionStatus;
    peer_id: string;
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
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Chat managed here now
    const [currentSpeaker, setCurrentSpeaker] = useState<LiveInteraction | null>(null);
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    // Refs
    const peerRef = useRef<Peer | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const activeCallRef = useRef<any>(null);
    const lastMessageTimeRef = useRef<number>(0);
    const channelRef = useRef<any>(null); // Keep reference to channel

    // Initialize Audio Element
    useEffect(() => {
        remoteAudioRef.current = new Audio();
    }, []);

    // 1. Initialize PeerJS
    useEffect(() => {
        if (!user || typeof window === 'undefined') return;

        const peer = new Peer(user.id, {
            debug: 2,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' }
                ]
            }
        });

        peer.on('open', (id) => {
            setPeerId(id);
            setConnectionError(null);
        });

        peer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            setConnectionError('Voice server connection failed.');
        });

        peer.on('call', async (call) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                call.answer(stream);
                activeCallRef.current = call;
                setStatus('live');

                call.on('stream', (remoteStream) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = remoteStream;
                        remoteAudioRef.current.play().catch(e => console.error("Error playing remote audio", e));
                    }
                });

                call.on('close', () => { handleEndCallCleanup(); });
            } catch (err) {
                console.error('Failed to get local stream', err);
                setConnectionError('Could not access microphone.');
            }
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [user]);

    // 2. Realtime Subscription (DB Hands + Broadcast Chat)
    useEffect(() => {
        const client = createClient();
        const isAdmin = profile?.role === 'admin';

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
                peer_id: user.id,
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
        if (!peerRef.current) return;
        try {
            await supabase.from('live_interactions').update({ status: 'live' }).eq('id', studentInteraction.id);
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
            } catch (e) { console.warn("No mic", e); }

            const call = peerRef.current.call(studentInteraction.peer_id, stream!);
            activeCallRef.current = call;
            setCurrentSpeaker(studentInteraction);

            call.on('stream', (studentStream) => {
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = studentStream;
                    remoteAudioRef.current.play();
                }
            });
            call.on('close', () => setCurrentSpeaker(null));
        } catch (e) { console.error("Error accepting", e); }
    };

    const endCall = async () => {
        if (activeCallRef.current) {
            activeCallRef.current.close();
            activeCallRef.current = null;
        }
        handleEndCallCleanup();

        if (currentSpeaker) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('id', currentSpeaker.id);
        } else if (status === 'waiting' && user) {
            await supabase.from('live_interactions').update({ status: 'ended' }).eq('user_id', user.id).eq('status', 'waiting');
        }
    };

    const handleEndCallCleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setStatus('idle');
        setCurrentSpeaker(null);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !isMuted; });
            setIsMuted(!isMuted);
        }
    };

    return {
        status,
        queue,
        messages, // Exported messages
        sendMessage, // Exported action
        currentSpeaker,
        raiseHand,
        acceptStudent,
        lowerAllHands, // Exported Admin Action
        endCall,
        toggleMute,
        isMuted,
        peerId,
        connectionError
    };
};

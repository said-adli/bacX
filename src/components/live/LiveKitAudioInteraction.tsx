import { LiveKitRoom, RoomAudioRenderer, useTracks } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';
import '@livekit/components-styles';

interface LiveKitAudioInteractionProps {
    roomName: string;
    userName: string; // The user's name
    prefetchedToken?: string; // [NEW] Accept token directly
    onDisconnected?: () => void;
}

export default function LiveKitAudioInteraction({ roomName, userName, prefetchedToken, onDisconnected }: LiveKitAudioInteractionProps) {
    const [token, setToken] = useState<string>(prefetchedToken || "");

    useEffect(() => {
        if (prefetchedToken) {
            setToken(prefetchedToken);
            return; // Don't fetch if provided
        }

        (async () => {
            try {
                const resp = await fetch(`/api/livekit/token?room=${roomName}`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomName, userName, prefetchedToken]);

    if (!token) {
        return <div className="text-sm text-zinc-500 animate-pulse">Connecting to audio server...</div>;
    }

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onDisconnected={onDisconnected}
            data-lk-theme="default"
            style={{ height: 'auto' }} // Override default filling
        >
            <RoomAudioRenderer />
            <AudioVisualizer />
        </LiveKitRoom>
    );
}

function AudioVisualizer() {
    const tracks = useTracks([Track.Source.Microphone]);

    return (
        <div className="flex gap-2 items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
            {tracks.length === 0 && (
                <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Waiting for audio...
                </div>
            )}

            {tracks.map((track) => (
                <TrackVisualizer key={track.publication.trackSid} trackRef={track} />
            ))}
        </div>
    );
}

function TrackVisualizer({ trackRef }: { trackRef: TrackReferenceOrPlaceholder }) {
    const isMuted = trackRef.publication?.isMuted ?? true;

    // If no publication yet (placeholder), don't render
    if (!trackRef.publication) {
        return null;
    }

    // In a real generic app, we'd use a canvas analyzer here. 
    // For now, let's just show an "Active" badge effectively.

    return (
        <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500 animate-pulse'}`}>
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-100">
                    {trackRef.participant.identity === trackRef.participant.name ? 'User' : trackRef.participant.name}
                </span>
                <span className="text-[10px] text-zinc-500">
                    {isMuted ? 'Muted' : 'Speaking via LiveKit'}
                </span>
            </div>
        </div>
    )
}

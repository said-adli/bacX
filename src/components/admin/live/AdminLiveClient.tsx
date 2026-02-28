"use client";

import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { ParticipationQueue } from "@/components/live/ParticipationQueue";
import LiveChat from "@/components/live/LiveChat";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, useTracks } from "@livekit/components-react";
import '@livekit/components-styles';
import { Track } from "livekit-client";

// --- INNER CONTENT (Uses Context) ---
function AdminLiveContent({ onExit }: { onExit?: () => void }) {
    const {
        queue,
        currentSpeaker,
        messages,
        sendMessage,
        acceptStudent,
        endCall,
        lowerAllHands,
    } = useLiveInteraction();

    return (
        <div className="space-y-6">
            {/* Audio Renderer for hearing students */}
            <RoomAudioRenderer />

            <div className="flex items-center justify-between">
                <div>
                    {onExit && (
                        <button onClick={onExit} className="text-zinc-400 hover:text-white mb-2 flex items-center gap-1 text-sm">
                            ← Back to Sessions
                        </button>
                    )}
                    <h1 className="text-3xl font-serif font-bold text-white mb-1">Live Room Control</h1>
                    <p className="text-zinc-500">Manage student interactions and broadcast chat</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-bold">ON AIR</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Queue & Audio Control */}
                <div className="space-y-6">
                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-5">
                        <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                            <Info size={18} />
                            إرشادات التحكم في المداخلات الصوتية
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300 leading-relaxed">
                            <li>تأكد من أن متصفحك يملك صلاحية الميكروفون.</li>
                            <li>عند قبول طالب (<span className="text-green-400 font-bold">Accept</span>)، سيتم تفعيل المايكروفون للطالب.</li>
                            <li>صوت الطالب سيدخل مباشرة إلى جهازك، تأكد من أن <span className="text-white font-bold">OBS</span> يلتقط صوت Desktop Audio.</li>
                        </ol>
                    </div>

                    {/* LIVEKIT VISUALIZER (Always visible if connected + tracks exist) */}
                    <AdminAudioVisualizer />

                    <ParticipationQueue
                        queue={queue}
                        currentSpeaker={currentSpeaker}
                        onAccept={acceptStudent}
                        onEndCall={endCall}
                        onLowerAll={lowerAllHands}
                    />
                </div>

                {/* RIGHT: Chat */}
                <div className="lg:col-span-2 h-[600px] flex flex-col">
                    <LiveChat messages={messages} onSendMessage={sendMessage} />
                </div>
            </div>
        </div>
    );
}

// --- MAIN WRAPPER (Providers) ---
export default function AdminLiveClient({ roomName, onExit }: { roomName: string; onExit?: () => void }) {
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/livekit/token?room=${roomName}`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomName]);

    if (!token) return <div className="p-10 text-center animate-pulse">Initializing Secure Live Environment...</div>;

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: 'auto' }}
        >
            <AdminLiveContent onExit={onExit} />
        </LiveKitRoom>
    );
}

// --- HELPER VISUALIZER ---
function AdminAudioVisualizer() {
    const tracks = useTracks([Track.Source.Microphone]);
    if (tracks.length === 0) return null;

    return (
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700 space-y-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase">Active Audio Feeds</h4>
            <div className="flex flex-wrap gap-2">
                {tracks.map(t => (
                    <div key={t.participant.identity} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-green-500/30">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-white">{t.participant.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

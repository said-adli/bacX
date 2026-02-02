"use client";

import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { ParticipationQueue } from "@/components/live/ParticipationQueue";
import { LiveChat } from "@/components/live/LiveChat";
import LiveKitAudioInteraction from "@/components/live/LiveKitAudioInteraction";
import { Info, AlertCircle } from "lucide-react";

export default function AdminLiveClient() {
    const {
        queue,
        currentSpeaker,
        messages,
        sendMessage,
        acceptStudent,
        endCall,
        status,
        lowerAllHands
    } = useLiveInteraction();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
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
                    {/* INSTRUCTIONS BLOCK (REQUESTED) */}
                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-5">
                        <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                            <Info size={18} />
                            إرشادات التحكم في المداخلات الصوتية
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300 leading-relaxed">
                            <li>تأكد من أن متصفحك يملك صلاحية الميكروفون.</li>
                            <li>عند قبول طالب (<span className="text-green-400 font-bold">Accept</span>)، سيتم تفعيل الـ LiveKit تلقائياً.</li>
                            <li>صوت الطالب سيدخل مباشرة إلى جهازك، تأكد من أن <span className="text-white font-bold">OBS</span> يلتقط صوت Desktop Audio ليسمعه بقية الطلبة في يوتيوب.</li>
                            <li>اضغط '<span className="text-red-400 font-bold">End</span>' لقطع الاتصال فوراً.</li>
                        </ol>
                    </div>

                    {/* LIVEKIT AUDIO (HIDDEN/VISIBLE) */}
                    {status === 'live' && currentSpeaker && (
                        <div className="animate-in slide-in-from-top-4 fade-in">
                            <LiveKitAudioInteraction
                                roomName={`class_room_main`} // Can be dynamic based on subject
                                userName="Teacher (Admin)"
                                onDisconnected={endCall}
                            />
                        </div>
                    )}

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

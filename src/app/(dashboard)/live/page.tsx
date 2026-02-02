"use client";

import { useAuth } from "@/context/AuthContext";
// import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import { usePlayer } from "@/context/PlayerContext";
import { useRef, useEffect } from "react";
import { Lock, MessageCircle, Users, Video, Loader2 } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { RaiseHandButton } from "@/components/live/RaiseHandButton";
import { LiveChat } from "@/components/live/LiveChat";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import LiveSessionSkeleton from "@/components/ui/skeletons/LiveSessionSkeleton";
import LiveKitAudioInteraction from "@/components/live/LiveKitAudioInteraction";

export default function LiveSessionsPage() {
    const { profile } = useAuth();
    const isSubscribed = profile?.is_subscribed === true;

    // [NEW] Real-Time Live Status Hook
    const { isLive, youtubeId, loading, title } = useLiveStatus();

    // [NEW] Live Interaction Hook
    const { status, raiseHand, endCall, currentSpeaker, messages, sendMessage } = useLiveInteraction();

    // [NEW] Ghost Player Integration (Live Mode)
    const { loadVideo, registerHeroTarget } = usePlayer();
    const heroTargetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (heroTargetRef.current) {
            registerHeroTarget(heroTargetRef.current);
        }
        return () => registerHeroTarget(null);
    }, [registerHeroTarget]);

    useEffect(() => {
        if (isLive && youtubeId) {
            loadVideo(youtubeId, title || "Live Session", true); // isLive = true
        }
    }, [isLive, youtubeId, title, loadVideo]);

    if (loading) {
        return <LiveSessionSkeleton />;
    }

    if (!isLive || !youtubeId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-6 border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Video className="w-10 h-10 text-white/30" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">
                        انتظرونا في الحصة القادمة
                    </h1>
                    <p className="text-xl text-white/60 font-light">
                        لا يوجد بث مباشر حالياً. سيتم إعلامكم بموعد الحصة القادمة قريباً.
                    </p>
                    <Link href="/materials" className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors mt-4">
                        تصفح الدروس المسجلة
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-1">الحصص المباشرة</h1>
                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        مباشر الآن
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Player Area */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden glass-panel relative border border-white/10 shadow-2xl">
                        {isSubscribed ? (
                            /* HERO PLAYER TARGET */
                            <div
                                ref={heroTargetRef}
                                className="w-full h-full bg-black/50"
                            />
                        ) : (
                            // GATEKEPT
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-center p-8 z-20">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">البث المباشر محمي</h3>
                                <p className="text-white/60 mb-8 max-w-lg text-lg">هذه الحصة حصرية للمشتركين في الباقة الذهبية. اشترك الآن واحضر جميع الحصص المباشرة مع الأساتذة.</p>
                                <Link href="/subscription" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-blue-900/40 hover:scale-105">
                                    فتح الاشتراك الآن
                                </Link>
                            </div>
                        )}

                        {!isSubscribed && <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000')] bg-cover bg-center opacity-30 pointer-events-none mix-blend-overlay" />}

                        {/* Notify if someone else is speaking */}
                        {isSubscribed && currentSpeaker && currentSpeaker.user_id !== profile?.id && (
                            <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-2 flex items-center gap-2 animate-in slide-in-from-top-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                <span className="text-xs text-white">يتحدث الآن: {currentSpeaker.user_name}</span>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{title || "بث مباشر"}</h2>
                            <p className="text-white/50">تقديم: الأستاذ محمد كريم</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-full text-sm">
                                <Users size={16} />
                                <span>-- مشاهد</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-Time Live Chat */}
                <div className="lg:col-span-1 h-[600px] flex flex-col">
                    <LiveChat messages={messages} onSendMessage={sendMessage} />
                </div>

            </div>

            {/* RAISE HAND BUTTON */}
            {isSubscribed && (
                <RaiseHandButton
                    status={status}
                    onClick={status === 'live' || status === 'waiting' ? endCall : raiseHand}
                    currentSpeakerName={currentSpeaker?.user_name}
                />
            )}

            {/* LIVEKIT AUDIO HANDLE (For Student who is Speaking) */}
            {status === 'live' && currentSpeaker?.user_id === profile?.id && (
                <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-10 fade-in">
                    <div className="bg-green-500/10 border border-green-500/50 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
                            <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">You are Live!</h4>
                            <p className="text-xs text-green-400">Your microphone is on</p>
                        </div>
                        <LiveKitAudioInteraction
                            roomName="class_room_main"
                            userName={profile?.full_name || "Student"}
                            onDisconnected={endCall}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

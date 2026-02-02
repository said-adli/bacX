"use client";

import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRef, useEffect, useState } from "react";
import { Lock, MessageCircle, Users, Video } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { RaiseHandButton } from "@/components/live/RaiseHandButton";
import { LiveChat } from "@/components/live/LiveChat";
import LiveSessionSkeleton from "@/components/ui/skeletons/LiveSessionSkeleton";
import LiveKitAudioInteraction from "@/components/live/LiveKitAudioInteraction";
import { getHybridLiveSession } from "@/actions/live";

export default function LiveSessionsPage() {
    const { profile } = useAuth();

    // [SECURE STATE]
    const [secureSession, setSecureSession] = useState<{
        loading: boolean;
        authorized: boolean;
        isLive: boolean;
        title?: string;
        youtubeId?: string;
        liveToken?: string;
        error?: string;
    }>({
        loading: true,
        authorized: false,
        isLive: false
    });

    const { loadVideo, registerHeroTarget } = usePlayer();
    const heroTargetRef = useRef<HTMLDivElement>(null);

    // Legacy Hooks (Keep Interaction logic but ignore data fetching parts if possible)
    // We might need to refactor useLiveInteraction later if it depends on RLS too much.
    // For now, let's assume it handles chat/hand-raise which is less critical than video access.
    const { status, raiseHand, endCall, currentSpeaker, messages, sendMessage } = useLiveInteraction();

    // 1. Register Hero Player Target
    useEffect(() => {
        if (heroTargetRef.current) {
            registerHeroTarget(heroTargetRef.current);
        }
        return () => registerHeroTarget(null);
    }, [registerHeroTarget]);

    // 2. Fetch Secure Session Data
    useEffect(() => {
        async function initSession() {
            try {
                const data = await getHybridLiveSession();
                setSecureSession({
                    loading: false,
                    authorized: data.authorized,
                    isLive: !!data.isLive,
                    title: data.title,
                    youtubeId: data.youtubeId,
                    liveToken: data.liveToken,
                    error: data.error
                });
            } catch (e) {
                console.error("Live session init failed", e);
                setSecureSession(prev => ({ ...prev, loading: false, error: "Connection failed" }));
            }
        }
        initSession();
    }, []);

    // 3. Load Video to Global Player
    useEffect(() => {
        if (secureSession.authorized && secureSession.isLive && secureSession.youtubeId) {
            loadVideo(secureSession.youtubeId, secureSession.title || "Live Session", true);
        }
    }, [secureSession, loadVideo]);

    if (secureSession.loading) {
        return <LiveSessionSkeleton />;
    }

    // 4. Unauthorized / No Access State
    if (!secureSession.authorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-6 border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-4 border border-red-500/20 text-red-500">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">
                        البث المباشر محمي
                    </h1>
                    <p className="text-xl text-white/60 font-light">
                        {secureSession.error || "عذراً، هذا البث متاح فقط للمشتركين."}
                    </p>
                    <Link href="/subscription" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg mt-4">
                        الاشتراك الآن
                    </Link>
                </GlassCard>
            </div>
        );
    }

    // 5. Not Live State
    if (secureSession.authorized && !secureSession.isLive) {
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

    // 6. Live Interface (Authorized)
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
                        {/* HERO PLAYER TARGET */}
                        <div
                            ref={heroTargetRef}
                            className="w-full h-full bg-black/50"
                        />

                        {/* Notify if someone else is speaking */}
                        {currentSpeaker && currentSpeaker.user_id !== profile?.id && (
                            <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-2 flex items-center gap-2 animate-in slide-in-from-top-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                                <span className="text-xs text-white">يتحدث الآن: {currentSpeaker.user_name}</span>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{secureSession.title || "بث مباشر"}</h2>
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
            <RaiseHandButton
                status={status}
                onClick={status === 'live' || status === 'waiting' ? endCall : raiseHand}
                currentSpeakerName={currentSpeaker?.user_name}
            />

            {/* LIVEKIT AUDIO HANDLE (For Student who is Speaking) */}
            {/* Must pass prefetchedToken securely */}
            {status === 'live' && currentSpeaker?.user_id === profile?.id && secureSession.liveToken && (
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
                            prefetchedToken={secureSession.liveToken} // [SECURE]
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

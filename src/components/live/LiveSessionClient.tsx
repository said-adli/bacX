"use client";

import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { useRef, useEffect, useState } from "react";
import { Lock, Users, Video, Headphones, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { RaiseHandButton } from "@/components/live/RaiseHandButton";
import LiveChat from "@/components/live/LiveChat";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import '@livekit/components-styles';

export interface SecureSession {
    authorized: boolean;
    isLive: boolean;
    title?: string;
    youtubeId?: string;
    liveToken?: string;
    livekitUrl?: string;
    error?: string;
    user?: {
        name: string;
        id: string;
    };
}

// --- LOADING SKELETON (prevents hydration mismatch) ---
function LiveSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-white/5" />
            <div className="h-6 w-48 bg-white/5 rounded-lg" />
            <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>
    );
}

// --- YOUTUBE PLAYER (fully independent from LiveKit, NO LiveKit hooks here) ---
function YouTubePlayerSection({ secureSession }: { secureSession: SecureSession }) {
    const { loadVideo, registerHeroTarget } = usePlayer();
    const heroTargetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (heroTargetRef.current) {
            registerHeroTarget(heroTargetRef.current);
        }
        return () => registerHeroTarget(null);
    }, [registerHeroTarget]);

    useEffect(() => {
        if (secureSession.authorized && secureSession.isLive && secureSession.youtubeId) {
            loadVideo(secureSession.youtubeId, secureSession.title || "Live Session", true);
        }
    }, [secureSession, loadVideo]);

    return (
        <div className="lg:col-span-3 space-y-4">
            <div className="w-full aspect-video rounded-2xl overflow-hidden glass-panel relative border border-white/10 shadow-2xl">
                <div ref={heroTargetRef} className="w-full h-full bg-black/50" />
            </div>

            <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{secureSession.title || "بث مباشر"}</h2>
                    <p className="text-white/50">تقديم: {secureSession.user?.name || "الأستاذ"}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-full text-sm">
                        <Users size={16} />
                        <span>-- مشاهد</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- INNER LIVEKIT UI (Must be rendered INSIDE <LiveKitRoom>) ---
function LiveKitAudioUI() {
    const { profile } = useAuth();
    // This hook uses `useRoomContext()`, so it MUST be inside LiveKitRoom
    const { status, raiseHand, endCall, currentSpeaker, messages, sendMessage } = useLiveInteraction();

    return (
        <div className="space-y-4 h-full flex flex-col">
            <RoomAudioRenderer />

            {/* Speaking indicator */}
            {currentSpeaker && currentSpeaker.user_id !== profile?.id && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <span className="text-xs text-white">يتحدث الآن: {currentSpeaker.user_name}</span>
                </div>
            )}

            <div className="flex-1 max-h-[600px] flex flex-col min-h-[400px]">
                <LiveChat messages={messages} onSendMessage={sendMessage} />
            </div>

            <RaiseHandButton
                status={status}
                onClick={status === 'live' || status === 'waiting' ? endCall : raiseHand}
                currentSpeakerName={currentSpeaker?.user_name}
            />

            {/* LIVE INDICATOR FOR SPEAKER */}
            {status === 'live' && currentSpeaker?.user_id === profile?.id && (
                <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-10 fade-in">
                    <div className="bg-green-500/10 border border-green-500/50 hidden md:block md:backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
                            <div className="relative w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">You are Live!</h4>
                            <p className="text-xs text-green-400">Your microphone is on</p>
                        </div>
                        <SelfAudioVisualizer />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- LIVEKIT PROVIDER WRAPPER ---
function LiveKitAudioSection({ secureSession }: { secureSession: SecureSession }) {
    const [userJoined, setUserJoined] = useState(false);
    const [lkError, setLkError] = useState<string | null>(null);

    // No token available — show degraded state (placeholder chat, no interaction)
    if (!secureSession.liveToken) {
        return (
            <div className="space-y-4">
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
                    <p className="text-sm text-yellow-300">الصوت التفاعلي غير متوفر حالياً. يمكنكم متابعة البث عبر الفيديو.</p>
                </div>
            </div>
        );
    }

    // User hasn't clicked join yet
    if (!userJoined) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => setUserJoined(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-lg"
                >
                    <Headphones size={22} />
                    انضمام بالصوت
                </button>
            </div>
        );
    }

    // LiveKit error state
    if (lkError) {
        return (
            <div className="space-y-4">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">فشل الاتصال بالصوت: {lkError}</p>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={secureSession.liveToken}
            serverUrl={secureSession.livekitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect={true}
            data-lk-theme="default"
            onError={(err) => {
                console.error("LiveKit connection error:", err);
                setLkError(err?.message || "Connection failed");
            }}
        >
            <LiveKitAudioUI />
        </LiveKitRoom>
    );
}

function SelfAudioVisualizer() {
    const barStyles = [
        { height: '68%', animationDuration: '0.8s' },
        { height: '42%', animationDuration: '1.1s' },
        { height: '85%', animationDuration: '0.6s' },
        { height: '55%', animationDuration: '0.9s' },
    ];

    return (
        <div className="flex gap-1 h-4 items-end">
            {barStyles.map((style, i) => (
                <div key={i} className="w-1 bg-green-500 animate-pulse" style={style} />
            ))}
        </div>
    );
}

// --- MAIN EXPORT CONTENT ---
function LiveSessionContent({ secureSession }: { secureSession: SecureSession }) {
    // Top-level structure wrapper
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
                {/* YouTube Player — ALWAYS renders, never blocked by LiveKit */}
                <YouTubePlayerSection secureSession={secureSession} />

                {/* LiveKit Audio + Chat — ISOLATED, errors stay here */}
                <div className="lg:col-span-1 h-full min-h-[600px] flex flex-col">
                    <LiveKitAudioSection secureSession={secureSession} />
                </div>
            </div>
        </div>
    );
}

export function LiveSessionClient({ initialSession }: { initialSession: SecureSession }) {
    // [HYDRATION GUARD] — Prevents React Error #419 for the ENTIRE PAGE
    const [mounted, setMounted] = useState(false);
    const [secureSession] = useState<SecureSession>(initialSession);
    const { isLive: isLiveStatusActive } = useLiveStatus();

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (secureSession.authorized && !secureSession.isLive && isLiveStatusActive) {
            window.location.reload();
        }
    }, [isLiveStatusActive, secureSession.authorized, secureSession.isLive]);

    // SSR skeleton — guarantees server/client output match
    if (!mounted) {
        return <LiveSkeleton />;
    }

    // Unauthorized
    if (!secureSession.authorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-6 border-white/10 shadow-2xl">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-4 border border-red-500/20 text-red-500">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">البث المباشر محمي</h1>
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

    // Not Live
    if (!secureSession.isLive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-12 text-center max-w-2xl mx-auto space-y-6 border-white/10 shadow-2xl">
                    <div className="w-24 h-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Video className="w-10 h-10 text-white/30" />
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">انتظرونا في الحصة القادمة</h1>
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

    // LIVE STATE
    return <LiveSessionContent secureSession={secureSession} />;
}


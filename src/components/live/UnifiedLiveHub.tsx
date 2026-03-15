"use client";

import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import React, { useRef, useEffect, useState, createContext, useContext } from "react";
import { Lock, Users, Video, Headphones, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useLiveInteraction } from "@/hooks/useLiveInteraction";
import { RaiseHandButton } from "@/components/live/RaiseHandButton";
import LiveChat from "@/components/live/LiveChat";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import '@livekit/components-styles';
import { UnifiedLiveEvent } from "@/actions/live";

// --- STATE MANAGEMENT: Live Engine Provider --- //

interface LiveEngineContextType {
    event: UnifiedLiveEvent | null;
    layoutVariant: 'fullscreen' | 'embedded';
}

const LiveEngineContext = createContext<LiveEngineContextType | null>(null);

export function useLiveEngine() {
    const context = useContext(LiveEngineContext);
    if (!context) throw new Error("useLiveEngine must be used within LiveEngineProvider");
    return context;
}

export function LiveEngineProvider({ 
    event, 
    layoutVariant = 'fullscreen',
    children 
}: { 
    event: UnifiedLiveEvent, 
    layoutVariant?: 'fullscreen' | 'embedded',
    children: React.ReactNode 
}) {
    // Determine if we should connect LiveKit
    const shouldConnect = event.liveToken && (event.status === 'live' || event.status === 'scheduled');

    return (
        <LiveEngineContext.Provider value={{ event, layoutVariant }}>
            {shouldConnect ? (
                <LiveKitRoom
                    video={false}
                    audio={true}
                    token={event.liveToken!}
                    serverUrl={event.livekitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    connect={true}
                    data-lk-theme="default"
                    className="flex flex-col h-full w-full"
                >
                    {children}
                </LiveKitRoom>
            ) : (
                <div className="flex flex-col h-full w-full">
                    {children}
                </div>
            )}
        </LiveEngineContext.Provider>
    );
}

// --- SUB-COMPONENTS --- //

function CommentsErrorBoundary({ children }: { children: React.ReactNode }) {
    // Simple wrapper since full class component is heavy, but let's keep it similar
    return <React.Suspense fallback={<div className="p-4 bg-red-500/10 text-red-300 rounded-xl">Chat Error</div>}>
        {children}
    </React.Suspense>
}

function YouTubePlayerSection() {
    const { event, layoutVariant } = useLiveEngine();
    const { loadVideo, registerHeroTarget } = usePlayer();
    const heroTargetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (heroTargetRef.current) {
            registerHeroTarget(heroTargetRef.current);
        }
        return () => registerHeroTarget(null);
    }, [registerHeroTarget]);

    useEffect(() => {
        if (event?.streamUrl) {
            loadVideo(event.streamUrl, event.title || "Live Stream", true);
        }
    }, [event, loadVideo]);

    const isFullscreen = layoutVariant === 'fullscreen';

    return (
        <div className={`space-y-4 ${isFullscreen ? 'lg:col-span-3' : 'w-full'}`}>
            <div className="w-full aspect-video rounded-2xl overflow-hidden glass-panel relative border border-white/10 shadow-2xl bg-black/10">
                <div ref={heroTargetRef} className="w-full h-full relative z-10" />
                
                {/* Fallback Overlays */}
                {event?.status === 'scheduled' && (
                    <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md">
                        <Video size={48} className="text-white/30 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">البث سيبدأ قريباً</h3>
                        <p className="text-white/50 text-center max-w-md">يرجى الانتظار، الأستاذ سيقوم بتفعيل الصوت والصورة قريباً.</p>
                    </div>
                )}
                {event?.status === 'ended' && !event.streamUrl && (
                    <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-md">
                        <Video size={48} className="text-white/30 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">انتهى البث</h3>
                        <p className="text-white/50">هذا البث المباشر قد انتهى وتم أرشفته.</p>
                    </div>
                )}
            </div>

            {isFullscreen && (
                <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{event?.title || "بث مباشر"}</h2>
                        <p className="text-white/50">تقديم: {event?.user?.name || "الأستاذ"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-full text-sm">
                            <Users size={16} />
                            <span>{event?.participants || '--'} مشاهد</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LiveKitAudioUI() {
    const { event, layoutVariant } = useLiveEngine();
    const { profile } = useAuth();
    
    // Safety check - If not in LiveKitRoom, this will throw or be empty, handled by Provider conditionally rendering children
    const { status, raiseHand, endCall, currentSpeaker, messages, sendMessage } = useLiveInteraction();

    const isFullscreen = layoutVariant === 'fullscreen';

    return (
        <div className={`flex flex-col h-full space-y-4 ${isFullscreen ? 'min-h-[400px]' : 'h-[500px]'}`}>
            <RoomAudioRenderer />

            {/* Speaking indicator */}
            {currentSpeaker && currentSpeaker.user_id !== profile?.id && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 shrink-0">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <span className="text-xs text-white">يتحدث الآن: {currentSpeaker.user_name}</span>
                </div>
            )}

            <div className={`flex-1 flex flex-col min-h-[300px] ${!isFullscreen && 'border border-white/5 rounded-xl p-2 bg-black/20'}`}>
                <CommentsErrorBoundary>
                    <LiveChat messages={messages} onSendMessage={sendMessage} />
                </CommentsErrorBoundary>
            </div>

            {event?.status === 'scheduled' ? (
                 <div className="p-3 bg-white/5 rounded-xl text-center text-sm text-white/50 shrink-0">
                     دردشة الانتظار مفتوحة
                 </div>
            ) : event?.status === 'ended' ? (
                <div className="p-3 bg-white/5 rounded-xl text-center text-sm text-white/50 shrink-0">
                    الدردشة مغلقة (انتهى البث)
                </div>
            ) : (
                <div className="shrink-0">
                    <RaiseHandButton
                        status={status}
                        onClick={status === 'live' || status === 'waiting' ? endCall : raiseHand}
                        currentSpeakerName={currentSpeaker?.user_name}
                    />
                </div>
            )}
        </div>
    );
}

function InteractiveSidebar() {
    const { event } = useLiveEngine();
    const [userJoined, setUserJoined] = useState(false);

    if (event?.status === 'ended') {
        return (
            <div className="space-y-4">
                 <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-white/40 shrink-0" />
                    <p className="text-sm text-white/50">انتهى هذا البث ولم تعد الميزات التفاعلية متاحة.</p>
                </div>
            </div>
        );
    }

    if (!event?.liveToken) {
        return (
            <div className="space-y-4">
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
                    <p className="text-sm text-yellow-300">الصوت التفاعلي غير متوفر حالياً. يمكنكم متابعة البث عبر الفيديو.</p>
                </div>
            </div>
        );
    }

    if (!userJoined) {
        return (
            <div className="space-y-4 flex flex-col justify-center h-full">
                <button
                    onClick={() => setUserJoined(true)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-lg"
                >
                    <Headphones size={22} />
                    انضمام للتفاعل الصوتي المباشر
                </button>
            </div>
        );
    }

    return <LiveKitAudioUI />;
}

// --- MAIN HUB CONTENT --- //

export function UnifiedLiveHub({ 
    initialEvent, 
    layoutVariant = 'fullscreen' 
}: { 
    initialEvent: UnifiedLiveEvent,
    layoutVariant?: 'fullscreen' | 'embedded' 
}) {
    const [mounted, setMounted] = useState(false);
    const { isLive: isLiveStatusActive } = useLiveStatus(); // Global status socket
    const isFullscreen = layoutVariant === 'fullscreen';

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reload if status switches globally to catch new tokens.
    useEffect(() => {
        if (initialEvent.authorized && initialEvent.status !== 'live' && isLiveStatusActive && !initialEvent.isLessonContext) {
            window.location.reload();
        }
    }, [isLiveStatusActive, initialEvent]);

    if (!mounted) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-white/5" />
                <div className="h-6 w-48 bg-white/5 rounded-lg" />
            </div>
        );
    }

    if (!initialEvent.authorized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-8 text-center max-w-xl mx-auto space-y-6 border-white/10 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 mx-auto flex items-center justify-center mb-4 border border-red-500/20 text-red-500">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">البث محمي</h2>
                    <p className="text-lg text-white/60 font-light">
                        {initialEvent.error || "عذراً، هذا المحتوى متاح للمشتركين فقط."}
                    </p>
                    <Link href="/subscription" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg mt-4">
                        الاشتراك الآن
                    </Link>
                </GlassCard>
            </div>
        );
    }

    if (initialEvent.status === 'ended' && !initialEvent.streamUrl && !initialEvent.isLessonContext) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6 animate-in fade-in zoom-in duration-700">
                <GlassCard className="p-8 text-center max-w-xl mx-auto space-y-6 border-white/10 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-white/30" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">انتظرونا في البث القادم</h2>
                    <p className="text-lg text-white/60 font-light">
                        لا يوجد بث مباشر نشط حالياً.
                    </p>
                    <Link href="/materials" className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors mt-4">
                        تصفح الدروس المسجلة
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <LiveEngineProvider event={initialEvent} layoutVariant={layoutVariant}>
            {isFullscreen ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Immersive Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-white mb-1">الحصص المباشرة</h1>
                            <div className="flex items-center gap-2 text-red-400 text-sm font-bold animate-pulse">
                                <span className={`w-2 h-2 rounded-full ${initialEvent.status === 'live' ? 'bg-red-500' : 'bg-gray-500'}`} />
                                {initialEvent.status === 'live' ? 'مباشر الآن' : initialEvent.status === 'scheduled' ? 'في الانتظار' : 'انتهى البث'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
                        <YouTubePlayerSection />
                        <div className="lg:col-span-1 flex flex-col relative z-20">
                            <InteractiveSidebar />
                        </div>
                    </div>
                </div>
            ) : (
                // Embedded Layout (For Course Player)
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    <div className="lg:col-span-2 flex flex-col space-y-4">
                         <YouTubePlayerSection />
                    </div>
                    <div className="space-y-4 flex flex-col">
                        <h3 className="text-xl font-bold text-white px-2">التفاعل المباشر</h3>
                        <InteractiveSidebar />
                    </div>
                </div>
            )}
        </LiveEngineProvider>
    );
}

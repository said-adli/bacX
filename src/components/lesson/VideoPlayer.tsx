"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
// import { GlassCard } from "../ui/GlassCard"; // Unused
import { ShieldAlert, Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveSync } from "@/hooks/useLiveSync"; // [NEW] Import Sync Hook

interface EncodedVideoPlayerProps {
    encodedVideoId: string;
    shouldMute?: boolean;
    onEnded?: () => void;
    isLive?: boolean; // [NEW] Live Mode Flag
    lessonId?: string; // [NEW] Enforce Lesson ID
}

export default function EncodedVideoPlayer({ encodedVideoId, shouldMute = false, onEnded, isLive = false, lessonId }: EncodedVideoPlayerProps) {
    const [decodedId, setDecodedId] = useState<string | null>(null);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [securityWarning, setSecurityWarning] = useState(false);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(true); // [FIX] Force ready to true immediately to stop infinite spin
    const [isBuffering, setIsBuffering] = useState(false); // [NEW] Custom Buffering
    // const [progress, setProgress] = useState(0); // 0-100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(shouldMute);
    // const [volume, setVolume] = useState(100);
    const [isHovering, setIsHovering] = useState(false);

    const { user } = useAuth();
    // const [sessionIp] = useState("192.168.x.x");
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // 2. Command Helper
    const sendCommand = useCallback((func: string, args: unknown[] = []) => {
        if (!iframeRef.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func, args }),
            '*'
        );
    }, []);

    // [NEW] Live Sync Integration
    useLiveSync({
        currentTime,
        duration,
        isLive,
        onSeek: (time) => sendCommand('seekTo', [time, true]),
        threshold: 5,   // Alert if >5s behind
        targetBuffer: 2 // Jump to 2s behind live edge
    });

    // 1. Decryption Logic (Preserved)
    useEffect(() => {
        let mounted = true;
        async function fetchDecodedId() {
            try {
                if (encodedVideoId.startsWith("enc_")) {
                    const parts = encodedVideoId.split("_");
                    if (parts.length >= 3 && mounted) {
                        setDecodedId(parts.slice(2).join("_"));
                        return;
                    }
                }
                const res = await fetch('/api/video/decrypt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encodedId: encodedVideoId, lessonId })
                });
                if (!res.ok) {
                    if (res.status === 400 || res.status === 403) {
                        if (mounted) setAccessError("Access Denied or Token Expired");
                        return;
                    }
                    throw new Error("Decryption failed");
                }
                const data = await res.json();
                if (mounted && data.videoId) setDecodedId(data.videoId);
                else if (mounted) setAccessError("Invalid Token");
            } catch (e) {
                // Decryption failed, using fallback
                if (mounted) setAccessError("Decryption Failed"); // SECURITY FIX: No fallback to demo video
            }
        }
        fetchDecodedId();
        return () => { mounted = false; };
    }, [encodedVideoId]);

    // 3. Status Listener (YouTube API)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
                try {
                    const data = JSON.parse(event.data);

                    // Initial Load Info
                    if (data.event === 'infoDelivery' && data.info) {
                        setIsReady(true); // [NEW] Player is communicating, safe to show

                        if (data.info.duration) setDuration(data.info.duration);
                        if (data.info.currentTime) setCurrentTime(data.info.currentTime);

                        // Player State: 1 = Playing, 2 = Paused, 3 = Buffering, 0 = Ended
                        if (data.info.playerState === 1) {
                            setIsPlaying(true);
                        } else if (data.info.playerState === 2) {
                            setIsPlaying(false);
                        } else if (data.info.playerState === 0 && onEnded) {
                            setIsPlaying(false);
                            setIsBuffering(false);
                            onEnded();
                        }
                    }
                } catch (e) { /* Ignore */ }
            }
        };
        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [onEnded]);

    // 4. Progress Polling 
    useEffect(() => {
        if (isPlaying || isLive) {
            progressInterval.current = setInterval(() => {
                // We rely mostly on 'infoDelivery' now, but could poll explicit 'getCurrentTime' if needed
            }, 1000);
        } else {
            if (progressInterval.current) clearInterval(progressInterval.current);
        }
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [isPlaying, isLive]);

    // 5. Controls Logic
    const togglePlay = () => {
        if (isPlaying) {
            sendCommand('pauseVideo');
            setIsPlaying(false);
        } else {
            sendCommand('playVideo');
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        // [MOD] If Live, seeking might be restricted or jump to live. 
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        // setProgress(parseFloat(e.target.value));
        setCurrentTime(newTime);
        sendCommand('seekTo', [newTime, true]);
    };

    const toggleMute = () => {
        if (isMuted) {
            sendCommand('unMute');
            setIsMuted(false);
        } else {
            sendCommand('mute');
            setIsMuted(true);
        }
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (containerRef.current) {
            containerRef.current.requestFullscreen();
        }
    };

    // 6. Security & Anti-Inspect
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F12" || (e.ctrlKey && (e.key === "I" || e.key === "u"))) {
                e.preventDefault();
                setSecurityWarning(true);
            }
        };
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (securityWarning) return (
        <div className="w-full aspect-video flex flex-col items-center justify-center bg-red-950/20 border-red-500/20 text-center p-8 backdrop-blur-md rounded-2xl">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Security Alert</h3>
            <button onClick={() => setSecurityWarning(false)} className="px-6 py-2 bg-red-600 rounded">Return</button>
        </div>
    );

    if (accessError) {
        return (
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-zinc-950 rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden relative text-center p-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20">
                    <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                <p className="text-zinc-400 max-w-sm">{accessError}</p>
            </div>
        );
    }

    const finalVideoId = decodedId ? extractYouTubeId(decodedId) : null;

    if (!decodedId || !finalVideoId) return <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-2xl flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden group select-none shadow-[0_0_50px_rgba(37,99,235,0.25)] border border-blue-500/20 bg-black"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* 1. THE IFRAME (GHOST MODE) */}
            <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${finalVideoId}?origin=${typeof window !== 'undefined' ? window.location.origin : ''}&enablejsapi=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1`}
                className={cn(
                    "w-full h-full object-cover pointer-events-none scale-[1.01] transition-opacity duration-700 ease-in-out",
                    isReady ? "opacity-100" : "opacity-0"
                )}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                title="Lesson Video"
            />

            {/* 2. THE GLASS SHIELD (CLICK INTERCEPTOR) */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
            />

            {/* 3. WATERMARK (UNDER CONTROLS) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
                <div className="absolute top-10 left-10 text-[10px] text-white/10 -rotate-12">{user?.email} • {user?.id.slice(0, 8)}</div>
                <div className="absolute bottom-1/3 right-1/3 text-[14px] font-bold text-white/5 -rotate-45">BRAINY PROTECTION</div>
            </div>

            {/* 4. CUSTOM CONTROLS UI */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300",
                ((isPlaying && !isHovering) && !isLive) ? "opacity-0" : "opacity-100"
            )}>
                {/* Progress Bar */}
                {isLive ? (
                    <div className="w-full h-1 bg-white/20 rounded-full mb-4 flex justify-end">
                        <div className="h-full bg-red-500 w-full animate-pulse shadow-[0_0_10px_red]" />
                    </div>
                ) : (
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration > 0 ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:[&::-webkit-slider-thumb]:scale-125 transition-all mb-4"
                    />
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="text-white hover:text-blue-400 transition-colors"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>

                        {/* Formatting Time or LIVE Badge */}
                        {isLive ? (
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs font-bold">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                LIVE
                            </div>
                        ) : (
                            <div className="text-xs text-white/80 font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        )}

                        {/* Volume */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="text-white hover:text-blue-400 transition-colors"
                    >
                        <Maximize size={20} />
                    </button>
                </div>
            </div>

            {/* Loading Spinner / Big Play Button Overlay */}
            {(!isPlaying && !isBuffering && isReady) && (
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Play size={32} fill="white" className="text-white ml-1" />
                    </div>
                </div>
            )}

            {/* [NEW] Buffering / Initial Load Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center bg-black">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
}

function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function extractYouTubeId(urlOrId: string): string | null {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : urlOrId;
}

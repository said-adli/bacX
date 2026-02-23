"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Play, Pause, Volume2, VolumeX, Maximize, Loader2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveSync } from "@/hooks/useLiveSync";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

interface EncodedVideoPlayerProps {
    encodedVideoId: string;
    shouldMute?: boolean;
    onEnded?: () => void;
    isLive?: boolean;
    lessonId?: string;
}

export default function EncodedVideoPlayer({ encodedVideoId, shouldMute = false, onEnded, isLive = false, lessonId }: EncodedVideoPlayerProps) {
    const [decodedId, setDecodedId] = useState<string | null>(null);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [securityWarning, setSecurityWarning] = useState(false);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(shouldMute);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    useLiveSync({
        currentTime,
        duration,
        isLive,
        onSeek: (time) => {
            if (playerRef.current?.seekTo) {
                playerRef.current.seekTo(time, true);
            }
        },
        threshold: 5,
        targetBuffer: 2
    });

    // 1. Decryption Logic
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
                if (mounted) setAccessError("Decryption Failed");
            }
        }
        fetchDecodedId();
        return () => { mounted = false; };
    }, [encodedVideoId, lessonId]);

    const finalVideoId = decodedId ? extractYouTubeId(decodedId) : null;

    // 2. Load YouTube Player API natively
    useEffect(() => {
        if (!finalVideoId) return;

        const initPlayer = () => {
            if (!iframeRef.current || playerRef.current) return;

            playerRef.current = new window.YT.Player(iframeRef.current, {
                events: {
                    onReady: (event: any) => {
                        setIsReady(true);
                        setDuration(event.target.getDuration());
                        if (shouldMute) {
                            event.target.mute();
                            setIsMuted(true);
                        }
                    },
                    onStateChange: (event: any) => {
                        const ytState = event.data;
                        if (ytState === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                            setIsBuffering(false);
                            setDuration(event.target.getDuration());
                        } else if (ytState === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                            setIsBuffering(false);
                        } else if (ytState === window.YT.PlayerState.BUFFERING) {
                            setIsBuffering(true);
                        } else if (ytState === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                            setIsBuffering(false);
                            if (onEnded) onEnded();
                        } else if (ytState === window.YT.PlayerState.UNSTARTED) {
                            setIsReady(true);
                        }
                    },
                    onPlaybackRateChange: (event: any) => {
                        setPlaybackRate(event.data);
                    }
                }
            });
        };

        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            if (firstScriptTag?.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
            window.onYouTubeIframeAPIReady = () => initPlayer();
        } else if (window.YT && window.YT.Player) {
            initPlayer();
        }

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
            // Wait with destroy for strict mode
        };
    }, [finalVideoId, shouldMute, onEnded]);

    // 3. Precise Progress Polling via API (real-time sync)
    useEffect(() => {
        if (isPlaying || isLive) {
            progressInterval.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                    if (playerRef.current.getDuration) {
                        const d = playerRef.current.getDuration();
                        if (d && d !== duration) setDuration(d);
                    }
                }
            }, 500);
        } else {
            if (progressInterval.current) clearInterval(progressInterval.current);
        }
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [isPlaying, isLive, duration]);

    // 4. Custom Controls Sync Handlers
    const togglePlay = () => {
        if (!playerRef.current?.playVideo) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!playerRef.current?.seekTo || isLive) return;
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        setCurrentTime(newTime);
        playerRef.current.seekTo(newTime, true);
    };

    const toggleMute = () => {
        if (!playerRef.current?.mute) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
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

    const changeSpeed = (rate: number) => {
        if (playerRef.current?.setPlaybackRate) {
            playerRef.current.setPlaybackRate(rate);
            setPlaybackRate(rate);
        }
        setShowSettings(false);
    };

    // 5. Security & Anti-Inspect
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
            <button onClick={() => setSecurityWarning(false)} className="px-6 py-2 bg-red-600 rounded mt-4 font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:bg-red-500">Return</button>
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

    if (!decodedId || !finalVideoId) return <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-2xl flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    // We use explicit ID for window.YT targeting
    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden group select-none shadow-[0_0_50px_rgba(37,99,235,0.25)] border border-blue-500/20 bg-black"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* 1. THE IFRAME WITH CONTROLS DISABLED (controls=0) */}
            <iframe
                id="player"
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

            {/* 4. CUSTOM CONTROLS UI - FULL SUITE */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300",
                ((isPlaying && !isHovering) && !isLive) ? "opacity-0" : "opacity-100"
            )}>
                {/* Progress Bar (Seeker) */}
                {isLive ? (
                    <div className="w-full h-1.5 bg-white/20 rounded-full mb-4 flex justify-end">
                        <div className="h-full bg-red-500 w-full animate-pulse shadow-[0_0_10px_red]" />
                    </div>
                ) : (
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration > 0 ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 hover:[&::-webkit-slider-thumb]:scale-125 transition-all mb-4 relative z-30 pointer-events-auto"
                    />
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        {/* Play/Pause Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="text-white hover:text-blue-400 transition-colors pointer-events-auto z-30"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>

                        {/* Volume Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="text-white/80 hover:text-white transition-colors pointer-events-auto z-30"
                        >
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>

                        {/* Formatting Time or LIVE Badge */}
                        {isLive ? (
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs font-bold">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                LIVE
                            </div>
                        ) : (
                            <div className="text-sm font-medium text-white/90 font-mono tracking-wide">
                                {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Playback Speed Control */}
                        {!isLive && (
                            <div className="relative pointer-events-auto z-30">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                                    className="flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors bg-white/10 px-2.5 py-1 rounded-md"
                                >
                                    <Settings size={14} className={showSettings ? "animate-spin" : ""} />
                                    {playbackRate}x
                                </button>

                                {showSettings && (
                                    <div className="absolute bottom-full right-0 mb-2 w-28 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl p-1 flex flex-col gap-0.5 animate-in slide-in-from-bottom-2 fade-in">
                                        {[0.5, 1, 1.5, 2].map((rate) => (
                                            <button
                                                key={rate}
                                                onClick={(e) => { e.stopPropagation(); changeSpeed(rate); }}
                                                className={cn(
                                                    "text-left px-3 py-1.5 text-sm rounded-lg transition-colors font-medium",
                                                    playbackRate === rate ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                                                )}
                                            >
                                                {rate === 1 ? 'Normal' : `${rate}x`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="text-white hover:text-blue-400 transition-colors pointer-events-auto z-30"
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading Spinner / Big Play Button Overlay */}
            {(!isPlaying && !isBuffering && isReady) && (
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-600/90 backdrop-blur-md shadow-[0_0_40px_rgba(37,99,235,0.5)] border border-blue-400/30 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                        <Play size={40} fill="white" className="text-white ml-2" />
                    </div>
                </div>
            )}

            {/* Buffering Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function extractYouTubeId(urlOrId: string): string | null {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : urlOrId;
}

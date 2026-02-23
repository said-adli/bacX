"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Play, Pause, Volume2, VolumeX, Maximize, Loader2, Settings, RectangleHorizontal, Type, Minimize } from "lucide-react";
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
    const [buffered, setBuffered] = useState(0);
    const [isMuted, setIsMuted] = useState(shouldMute);
    const [playbackRate, setPlaybackRate] = useState(1);

    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isTheater, setIsTheater] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-hide controls
    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 2000);
    }, [isPlaying]);

    const handleMouseLeave = useCallback(() => {
        if (isPlaying) setShowControls(false);
    }, [isPlaying]);

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
                            // Trigger auto-hide
                            handleMouseMove();
                        } else if (ytState === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                            setIsBuffering(false);
                            setShowControls(true);
                        } else if (ytState === window.YT.PlayerState.BUFFERING) {
                            setIsBuffering(true);
                            setShowControls(true);
                        } else if (ytState === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                            setIsBuffering(false);
                            setShowControls(true);
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
    }, [finalVideoId, shouldMute, onEnded, handleMouseMove]);

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
                    if (playerRef.current.getVideoLoadedFraction) {
                        setBuffered(playerRef.current.getVideoLoadedFraction() * 100);
                    }
                }
            }, 500);
        } else {
            if (progressInterval.current) clearInterval(progressInterval.current);
        }
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [isPlaying, isLive, duration]);

    // 4. Custom Controls Sync Handlers
    const togglePlay = useCallback(() => {
        if (!playerRef.current?.playVideo) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    }, [isPlaying]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!playerRef.current?.seekTo || isLive) return;
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        setCurrentTime(newTime);
        playerRef.current.seekTo(newTime, true);
    };

    const handleSeekRelative = useCallback((seconds: number) => {
        if (!playerRef.current?.seekTo || isLive) return;
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        setCurrentTime(newTime);
        playerRef.current.seekTo(newTime, true);

        // Show controls temporarily
        handleMouseMove();
    }, [currentTime, duration, isLive, handleMouseMove]);

    const toggleMute = useCallback(() => {
        if (!playerRef.current?.mute) return;
        if (isMuted) {
            playerRef.current.unMute();
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    }, [isMuted]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen().catch(err => {
                    console.error("Error attempting to enable fullscreen:", err);
                });
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    // Fullscreen Event Listener to sync state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleTheater = useCallback(() => {
        setIsTheater(t => !t);
    }, []);

    const changeSpeed = (rate: number) => {
        if (playerRef.current?.setPlaybackRate) {
            playerRef.current.setPlaybackRate(rate);
            setPlaybackRate(rate);
        }
        setShowSettings(false);
    };

    const toggleCaptions = () => {
        if (playerRef.current?.loadModule) {
            // Pseudo-toggle for CC if available in iframe API
            // Note: YouTube iframe API cc_load_policy is better, but doing our best dynamically
            try {
                const isLoaded = playerRef.current.getOption('captions', 'tracklist') !== undefined;
                if (!isLoaded) {
                    playerRef.current.loadModule('captions');
                } else {
                    playerRef.current.unloadModule('captions'); /* fallback */
                }
            } catch (e) {
                console.log("Captions module error", e);
            }
        }
        setShowSettings(false);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    handleSeekRelative(-5);
                    break;
                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    handleSeekRelative(5);
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 't':
                    e.preventDefault();
                    toggleTheater();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, handleSeekRelative, toggleFullscreen, toggleMute, toggleTheater]);

    // 5. Security & Anti-Inspect
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            // Custom context menu could go here. For now, we just disable the default.
        };
        const handleAntiInspect = (e: KeyboardEvent) => {
            if (e.key === "F12" || (e.ctrlKey && (e.key === "I" || e.key === "u"))) {
                e.preventDefault();
                setSecurityWarning(true);
            }
        };
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleAntiInspect);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleAntiInspect);
        };
    }, []);

    if (securityWarning) return (
        <div className="w-full aspect-video flex flex-col items-center justify-center bg-red-950/20 border border-red-500/20 text-center p-8 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.15)]">
            <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">Security Alert</h3>
            <button onClick={() => setSecurityWarning(false)} className="px-6 py-2 bg-red-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:bg-red-500">Return</button>
        </div>
    );

    if (accessError) {
        return (
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-red-950/30 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden relative text-center p-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20 backdrop-blur-xl">
                    <ShieldAlert className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                <p className="text-red-200/50 max-w-sm">{accessError}</p>
            </div>
        );
    }

    if (!decodedId || !finalVideoId) return (
        <div className="w-full aspect-video bg-gradient-to-br from-[#020817] to-[#0a192f] animate-pulse rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.1)]">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        </div>
    );

    return (
        <>
            {/* Spacer for when Theater mode breaks out of document flow */}
            {isTheater && !isFullscreen && <div className="w-full aspect-video" aria-hidden="true" />}

            <div
                ref={containerRef}
                className={cn(
                    "relative overflow-hidden group select-none shadow-[0_0_50px_rgba(37,99,235,0.25)] border border-blue-500/20 transition-all duration-500 ease-in-out",
                    (isTheater && !isFullscreen) ? "fixed inset-x-0 top-0 mt-16 z-[60] w-[100vw] h-[calc(100vh-4rem)] rounded-none bg-black" : "w-full aspect-video rounded-2xl bg-gradient-to-br from-[#020817] to-[#0a192f]"
                )}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* 1. THE IFRAME WITH CONTROLS DISABLED */}
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

                {/* 2. MOBILE GESTURES & INTERACTION LAYER */}
                <div className="absolute inset-0 z-10 flex">
                    {/* Left Double Tap */}
                    <div
                        className="w-[30%] h-full cursor-pointer"
                        onDoubleClick={(e) => { e.stopPropagation(); handleSeekRelative(-10); }}
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    />
                    {/* Center Tap */}
                    <div
                        className="w-[40%] h-full cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        onDoubleClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    />
                    {/* Right Double Tap */}
                    <div
                        className="w-[30%] h-full cursor-pointer"
                        onDoubleClick={(e) => { e.stopPropagation(); handleSeekRelative(10); }}
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    />
                </div>

                {/* 3. WATERMARK */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.15]">
                    <div className="absolute top-10 left-10 text-[10px] text-white/20 -rotate-12 font-mono tracking-widest">{user?.email} • {user?.id?.slice(0, 8)}</div>
                    <div className="absolute bottom-1/3 right-1/3 text-[14px] font-bold text-white/10 -rotate-45 tracking-[0.5em]">BRAINY PROTECTION</div>
                </div>

                {/* 4. CUSTOM CONTROLS UI - GLASSMORPHISM */}
                <div
                    dir="ltr"
                    className={cn(
                        "absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-t from-blue-950/80 to-transparent backdrop-blur-md border-t border-white/5 transition-all duration-300",
                        (!showControls && isPlaying && !isLive) ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
                    )}>
                    {/* Progress Bar (Scrubber) */}
                    {isLive ? (
                        <div className="w-full h-1.5 bg-white/10 rounded-full mb-3 flex justify-end">
                            <div className="h-full bg-red-500 w-full animate-pulse shadow-[0_0_15px_red] rounded-full" />
                        </div>
                    ) : (
                        <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-3 group/scrubber cursor-pointer flex items-center pointer-events-auto">
                            {/* Buffer bar */}
                            <div className="absolute left-0 top-0 h-full bg-white/30 rounded-full pointer-events-none transition-all duration-300" style={{ width: `${buffered}%` }} />

                            {/* Progress bar */}
                            <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full pointer-events-none shadow-[0_0_10px_rgba(37,99,235,0.8)] transition-all" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />

                            {/* Input range */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                            />

                            {/* Knob */}
                            <div
                                className="absolute w-3.5 h-3.5 bg-white rounded-full pointer-events-none top-1/2 -translate-y-1/2 scale-0 group-hover/scrubber:scale-100 transition-transform z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)] transform -translate-x-1/2"
                                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        {/* LEFT CONTROLS */}
                        <div className="flex items-center gap-5">
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="text-white hover:text-blue-400 transition-transform hover:scale-110 pointer-events-auto z-30 flex items-center justify-center w-8 h-8"
                            >
                                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                className="text-white/80 hover:text-white transition-transform hover:scale-110 pointer-events-auto z-30 flex items-center justify-center w-8 h-8"
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>

                            {isLive ? (
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-red-500/20 border border-red-500/50 rounded-md text-red-500 text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" />
                                    LIVE
                                </div>
                            ) : (
                                <div className="text-xs font-medium text-white/90 font-mono tracking-wide flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                    <span>{formatTime(currentTime)}</span>
                                    <span className="text-white/30 text-[10px]">/</span>
                                    <span className="text-white/60">{formatTime(duration)}</span>
                                </div>
                            )}
                        </div>

                        {/* RIGHT CONTROLS */}
                        <div className="flex items-center gap-4">
                            {!isLive && (
                                <div className="relative pointer-events-auto z-30">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                                        className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                                            showSettings ? "bg-white/10 text-white rotate-90" : "text-white/80 hover:text-white hover:bg-white/5 hover:rotate-45"
                                        )}
                                    >
                                        <Settings size={18} />
                                    </button>

                                    {showSettings && (
                                        <div className="absolute bottom-full right-0 mb-4 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom-2 fade-in zoom-in-95">
                                            <div className="px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5">
                                                Playback Speed
                                            </div>
                                            <div className="p-1 grid grid-cols-2 gap-1 backdrop-blur-xl">
                                                {[0.5, 1, 1.5, 2].map((rate) => (
                                                    <button
                                                        key={rate}
                                                        onClick={(e) => { e.stopPropagation(); changeSpeed(rate); }}
                                                        className={cn(
                                                            "text-center px-2 py-2 text-xs rounded-xl transition-all font-bold",
                                                            playbackRate === rate ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-slate-300 hover:bg-white/10 hover:text-white"
                                                        )}
                                                    >
                                                        {rate === 1 ? 'Normal' : `${rate}x`}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="px-4 py-2 mt-1 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-t border-white/5">
                                                Subtitles
                                            </div>
                                            <div className="p-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleCaptions(); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                                                >
                                                    <Type size={14} className="text-blue-400" />
                                                    Toggle CC
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleTheater(); }}
                                className={cn(
                                    "text-white/80 hover:text-white transition-transform hover:scale-110 pointer-events-auto z-30 flex items-center justify-center w-8 h-8",
                                    isTheater && "text-blue-400"
                                )}
                                title="Theater mode (t)"
                            >
                                <RectangleHorizontal size={20} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                className="text-white hover:text-blue-400 transition-transform hover:scale-110 pointer-events-auto z-30 flex items-center justify-center w-8 h-8"
                                title="Fullscreen (f)"
                            >
                                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Big Play Button Overlay For Unstarted */}
                {(!isPlaying && !isBuffering && isReady && currentTime === 0) && (
                    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-600/80 backdrop-blur-xl shadow-[0_0_60px_rgba(37,99,235,0.6)] border border-blue-400/30 flex items-center justify-center animate-in fade-in zoom-in duration-500">
                            <Play size={36} fill="white" className="text-white ml-2" />
                        </div>
                    </div>
                )}

                {/* Buffering Spinner */}
                {(isBuffering || !isReady) && !accessError && decodedId && finalVideoId && (
                    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin shadow-[0_0_30px_rgba(37,99,235,0.5)] rounded-full" />
                    </div>
                )}
            </div>
        </>
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

"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Loader2, Play, Pause, X, Maximize, Volume2, VolumeX, Volume1 } from "lucide-react";
import { useVideoHotkeys } from "@/hooks/useVideoHotkeys";

export function GlobalVideoPlayer() {
    const {
        videoId,
        isLive,
        isPlaying,
        togglePlay,
        closePlayer,
        viewMode,
        heroTarget,
        miniTarget
    } = usePlayer();

    const { user } = useAuth();
    // Simple derivation - no need for effect+setState
    const decodedId = useMemo(() => videoId || null, [videoId]);
    const [isReady, setIsReady] = useState(false);

    // Internal Player State (Source of Truth for UI)
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [_buffered, setBuffered] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    // Refs
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const _progressInterval = useRef<NodeJS.Timeout | null>(null);

    // ============================================================================
    // COMMAND BUS
    // ============================================================================
    const sendCommand = useCallback((func: string, args: unknown[] = []) => {
        if (!iframeRef.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func, args }),
            '*'
        );
    }, []);

    // Note: decodedId is now derived via useMemo, no effect needed

    // 2. Play/Pause Sync
    useEffect(() => {
        if (isPlaying) sendCommand('playVideo');
        else sendCommand('pauseVideo');
    }, [isPlaying, sendCommand]);

    // 3. YouTube Event Listener (Status, Time, Duration)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
                try {
                    const data = JSON.parse(event.data);

                    if (data.event === 'infoDelivery' && data.info) {
                        setIsReady(true);

                        // Sync Time (if explicit)
                        if (data.info.currentTime) setCurrentTime(data.info.currentTime);
                        if (data.info.duration) setDuration(data.info.duration);

                        // Sync Playback Status (Optional: Update Context if iframe changes state internally)
                        // Note: We mostly drive FROM context, but if buffering/ended happens, we might want to know.
                    }
                } catch (e) { /* Ignore non-JSON messages */ }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // 4. Polling for Smooth Progress (YouTube API 'infoDelivery' can be sparse)
    useEffect(() => {
        if (isPlaying && !isLive) {
            // We can't actually poll "getCurrentTime" easily with postMessage without a bridge 
            // unless we rely on 'infoDelivery' interval. 
            // Standard YouTube Iframe API emits infoDelivery roughly every 500ms-1s when events occur.
            // For smoother UI, we might extrapolate, but let's stick to received data for stability first.
        }
    }, [isPlaying, isLive]);


    // ============================================================================
    // ACTIONS
    // ============================================================================
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isLive) return;
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime); // Optimistic UI
        sendCommand('seekTo', [newTime, true]);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
        sendCommand('setVolume', [newVol]);
        if (newVol > 0 && isMuted) {
            setIsMuted(false);
            sendCommand('unMute');
        }
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

    const changeSpeed = (speed: number) => {
        setPlaybackRate(speed);
        sendCommand('setPlaybackRate', [speed]);
        setShowSpeedMenu(false);
    };

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    // Helper: Seek By
    const seekBy = useCallback((seconds: number) => {
        if (isLive) return;
        const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
        setCurrentTime(newTime);
        sendCommand('seekTo', [newTime, true]);
    }, [currentTime, duration, isLive, sendCommand]);

    // Keyboard Shortcuts
    useVideoHotkeys({
        togglePlay,
        toggleMute,
        toggleFullscreen,
        seekBy,
        isEnabled: !!videoId // Only enable if player is active
    });

    // Helper: Time Format
    const formatTime = (seconds: number) => {
        if (!seconds) return "0:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };


    // ============================================================================
    // RENDER
    // ============================================================================

    if (!videoId || !decodedId) return null;

    // Portal Priority
    const target = viewMode === 'hero' ? heroTarget : miniTarget;
    if (!target) return null;

    const content = (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full h-full bg-black overflow-hidden group shadow-2xl select-none",
                viewMode === 'mini' ? "rounded-xl border border-white/10" : "rounded-none"
            )}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => { setIsHovering(false); setShowSpeedMenu(false); }}
        >
            {/* 1. YOUTUBE IFRAME (Ghost Mode) */}
            <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${decodedId}?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                className="w-full h-full object-cover pointer-events-none"
                allow="autoplay; encrypted-media"
                title="Ghost Player"
            />

            {/* 2. INTERACTION LAYER (The Shield) */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
                onContextMenu={(e) => e.preventDefault()}
            />

            {/* 3. BRANDING MASK (The Cover-Up) */}
            {/* Hides YouTube Watermark (Bottom Right) */}
            <div className={cn(
                "absolute bottom-0 right-0 z-20 pointer-events-none flex items-end justify-end pb-8 pr-4",
                viewMode === 'mini' ? "opacity-0" : "opacity-100" // Hide in mini mode to save space/avoid checking
            )}>
                {/* Solid or Blurry Patch */}
                <div className="w-24 h-12 bg-black/10 backdrop-blur-md rounded-tl-2xl" />
                {/* Platform Logo */}
                <div className="absolute bottom-4 right-4 text-white/50 text-xs font-bold tracking-widest font-serif opacity-80">
                    BRAINY
                </div>
            </div>

            {/* 4. WATERMARK (Anti-Piracy) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
                <div className="absolute top-8 left-8 text-[10px] text-white/30 -rotate-6">{user?.email}</div>
                <div className="absolute bottom-1/3 right-1/2 text-[12px] font-bold text-white/10 -rotate-12 translate-x-1/2">BRAINY PROTECTED</div>
            </div>

            {/* 5. CUSTOM CONTROL BAR */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 pt-12 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-opacity duration-300",
                (!isPlaying || isHovering || viewMode === 'mini') ? "opacity-100" : "opacity-0"
            )}>
                {/* SCRUBBER (Only if not Live and not Mini) */}
                {(!isLive && viewMode === 'hero') && (
                    <div className="relative w-full h-1.5 mb-4 group/scrubber cursor-pointer z-40">
                        {/* Background Track */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-full overflow-hidden">
                            {/* Played Progress */}
                            <div
                                className="h-full bg-blue-500 relative"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                        {/* Input Range (Invisible but Functional) */}
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={(e) => { e.stopPropagation(); handleSeek(e); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 pointer-events-auto"
                        />
                        {/* Thumb Indicator (Visual Only) */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] pointer-events-none transition-transform group-hover/scrubber:scale-150"
                            style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                        />
                    </div>
                )}

                {/* CONTROLS ROW */}
                <div className="flex items-center justify-between pointer-events-auto">

                    {/* LEFT: Play, Volume, Time */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="text-white hover:text-blue-400 transition-colors"
                        >
                            {isPlaying ? <Pause size={viewMode === 'mini' ? 18 : 24} fill="currentColor" /> : <Play size={viewMode === 'mini' ? 18 : 24} fill="currentColor" />}
                        </button>

                        {/* Volume (Hidden in Mini) */}
                        {viewMode === 'hero' && (
                            <div className="flex items-center gap-2 group/vol">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    className="text-white/80 hover:text-white"
                                >
                                    {isMuted ? <VolumeX size={20} /> : (volume > 50 ? <Volume2 size={20} /> : <Volume1 size={20} />)}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                                    className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 h-1 bg-white/20 hover:bg-white/40 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>
                        )}

                        {/* Status / Time */}
                        {isLive ? (
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-red-600/20 border border-red-500/50 rounded text-red-500 text-xs font-bold animate-pulse">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                LIVE
                            </div>
                        ) : (
                            viewMode === 'hero' && (
                                <div className="text-xs text-white/70 font-mono tracking-wide">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            )
                        )}
                    </div>

                    {/* RIGHT: Speed, Fullscreen, Close (Mini) */}
                    <div className="flex items-center gap-3">
                        {/* Speed Control (Not in Live, Not in Mini) */}
                        {(!isLive && viewMode === 'hero') && (
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                                    className="text-xs font-bold text-white/80 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
                                >
                                    {playbackRate}x
                                </button>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 rounded-lg overflow-hidden flex flex-col min-w-[60px]">
                                        {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={(e) => { e.stopPropagation(); changeSpeed(speed); }}
                                                className={cn(
                                                    "px-3 py-2 text-xs hover:bg-white/10 text-left",
                                                    playbackRate === speed ? "text-blue-400 font-bold" : "text-white/70"
                                                )}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Maximize / Fullscreen */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="text-white hover:text-blue-400 transition-colors"
                        >
                            <Maximize size={18} />
                        </button>

                        {/* Close (Mini Only) */}
                        {viewMode === 'mini' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                                className="p-1 hover:bg-red-500/20 rounded-full text-white/70 hover:text-red-400 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 6. BUFFERING INDICATOR */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );

    return createPortal(content, target);
}

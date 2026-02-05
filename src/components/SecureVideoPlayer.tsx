"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Loader2, ShieldAlert, Maximize, Pause, Volume2, VolumeX } from "lucide-react";
import { getSecureVideoId } from "@/actions/video";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SecureVideoPlayerProps {
    lessonId: string;
    // Optional: Keep these for UI consistency if needed
    title?: string;
    onEnded?: () => void;
}

export default function SecureVideoPlayer({ lessonId, onEnded }: SecureVideoPlayerProps) {
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false); // UI State for controls
    const [error, setError] = useState<string | null>(null);

    // Player Refs
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Lazy Load Handler
    const handlePlay = async () => {
        if (videoId) {
            // Already loaded, just toggle play via command
            sendCommand('playVideo');
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const id = await getSecureVideoId(lessonId);
            if (!id) throw new Error("Video not available");
            setVideoId(id);
            setIsPlaying(true);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            console.error("Video Load Error:", e);
            setError(errorMessage || "Failed to load video");
            toast.error("Access Denied: " + (errorMessage || "Please check your subscription"));
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Command Helper (PostMessage)
    const sendCommand = useCallback((func: string, args: unknown[] = []) => {
        if (!iframeRef.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func, args }),
            '*'
        );
    }, []);

    // 3. Security: Cleanup on Unmount
    useEffect(() => {
        return () => {
            setVideoId(null); // Clear ID from memory/state
        };
    }, []);

    // 4. Security: Block Right Click
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    // 5. Toggle Fullscreen
    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (containerRef.current) {
            containerRef.current.requestFullscreen();
        }
    };

    // 6. Pause Handler
    const handlePause = () => {
        sendCommand('pauseVideo');
        setIsPlaying(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 select-none group"
            onContextMenu={handleContextMenu}
        >
            {/* ERROR STATE */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-red-500 z-50">
                    <ShieldAlert size={48} className="mb-4" />
                    <p className="font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="mt-4 text-sm text-zinc-400 hover:text-white underline">
                        Try Again
                    </button>
                </div>
            )}

            {/* VIDEO FRAME (Conditional Render) */}
            {videoId ? (
                <>
                    <iframe
                        ref={iframeRef}
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&disablekb=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                        className="w-full h-full object-cover pointer-events-none"
                        allow="autoplay; encrypted-media"
                        title="Secure Video"
                    />

                    {/* THE SHIELD: Intercepts all clicks */}
                    <div
                        className="absolute inset-0 z-10 cursor-pointer bg-transparent"
                        onClick={isPlaying ? handlePause : handlePlay}
                        onDoubleClick={toggleFullscreen}
                    />

                    {/* CUSTOM CONTROLS OVERLAY (Simple) */}
                    <div className={cn(
                        "absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 flex items-center justify-between",
                        isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    )}>
                        <div className="flex gap-4">
                            <button onClick={isPlaying ? handlePause : handlePlay} className="text-white hover:text-blue-400">
                                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>
                        </div>
                        <button onClick={toggleFullscreen} className="text-white hover:text-blue-400">
                            <Maximize size={20} />
                        </button>
                    </div>
                </>
            ) : (
                /* PLACEHOLDER / CLICK TO LOAD */
                <div onClick={handlePlay} className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-zinc-900 hover:bg-zinc-800 transition-colors z-20">
                    {isLoading ? (
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] mb-4">
                                <Play size={32} className="text-white ml-2" fill="white" />
                            </div>
                            <p className="text-zinc-400 font-medium">Click to Load Secure Video</p>
                        </>
                    )}
                </div>
            )}

            {/* WATERMARK */}
            <div className="absolute top-4 left-4 z-0 pointer-events-none opacity-20 text-[10px] text-white select-none">
                SECURE PLAYBACK
            </div>
        </div>
    );
}

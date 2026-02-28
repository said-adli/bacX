"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";

// Types
type ViewMode = 'hero' | 'mini' | 'hidden';

interface PlayerState {
    videoId: string | null;
    isPlaying: boolean;
    isMuted: boolean;
    progress: number;
    duration: number;
    title?: string;
    isLive: boolean;
}

interface PlayerContextType extends PlayerState {
    // Actions
    loadVideo: (id: string, title?: string, isLive?: boolean) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    setVolume: (vol: number) => void;
    seekTo: (time: number) => void;
    closePlayer: () => void;

    // Portal Targets
    registerHeroTarget: (node: HTMLElement | null) => void;
    registerMiniTarget: (node: HTMLElement | null) => void;

    // State Access
    heroTarget: HTMLElement | null;
    miniTarget: HTMLElement | null;
    viewMode: ViewMode;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    // Media State
    const [videoId, setVideoId] = useState<string | null>(null);
    const [title, setTitle] = useState<string | undefined>(undefined);
    const [isLive, setIsLive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration] = useState(0);
    const [_volume, setVolumeState] = useState(100); // 0-100

    // Portal Targets (DOM Nodes)
    const [heroTarget, setHeroTarget] = useState<HTMLElement | null>(null);
    const [miniTarget, setMiniTarget] = useState<HTMLElement | null>(null);

    // Derived View Mode - use useMemo instead of useEffect+setState
    const viewMode = useMemo<ViewMode>(() => {
        if (!videoId) return 'hidden';
        if (heroTarget) return 'hero';
        return 'mini';
    }, [videoId, heroTarget]);

    // Actions
    const loadVideo = useCallback((id: string, videoTitle?: string, liveMode?: boolean) => {
        setVideoId(id);
        if (videoTitle) setTitle(videoTitle);
        setIsLive(!!liveMode);
        setIsPlaying(true);
    }, []);

    const play = useCallback(() => setIsPlaying(true), []);
    const pause = useCallback(() => setIsPlaying(false), []);
    const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
    const setVolume = useCallback((vol: number) => setVolumeState(vol), []);
    const seekTo = useCallback((time: number) => {
        // This will be consumed by the player component via a refined mechanism or 
        // the player component can listen to a command event/state
        // For simplicity, we'll expose a command bus or just update state 
        // and let the player effect react (though seeking needs to be imperative usually)
        // We'll implemented a specific EventBus or specific callback registration for the player later if needed.
        // For now, let's keep it simple state.
        setProgress(time);
    }, []);

    const closePlayer = useCallback(() => {
        setVideoId(null);
        setIsPlaying(false);
        setHeroTarget(null); // Reset expectations
    }, []);

    // Registration Handlers (Stable Identity)
    const registerHeroTarget = useCallback((node: HTMLElement | null) => {
        setHeroTarget(node);
    }, []);

    const registerMiniTarget = useCallback((node: HTMLElement | null) => {
        setMiniTarget(node);
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                videoId,
                title,
                isLive,
                isPlaying,
                isMuted,
                progress,
                duration,
                loadVideo,
                play,
                pause,
                togglePlay,
                setVolume,
                seekTo,
                closePlayer,
                registerHeroTarget,
                registerMiniTarget,
                heroTarget,
                miniTarget,
                viewMode
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}

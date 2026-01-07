"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v2 - SCANNER MODE
 * Tracks: Auth State, Router Status, Checkpoints, Fetch Times
 */

interface Checkpoint {
    label: string;
    timestamp: string;
    elapsed?: number;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    lastNavClick: string | null;
    lastNavTarget: string | null;
    pathname: string;
    renderCount: number;
    checkpoints: Checkpoint[];
    lastFetchTime: number | null;
}

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_NAV_END?: () => void;
        __DIAG_CHECKPOINT?: (label: string) => void;
        __DIAG_FETCH_TIME?: (ms: number) => void;
    }
}

export function DiagnosticOverlay() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [state, setState] = useState<DiagnosticState>({
        authState: "LOADING",
        routerStatus: "IDLE",
        lastNavClick: null,
        lastNavTarget: null,
        pathname: "",
        renderCount: 0,
        checkpoints: [],
        lastFetchTime: null,
    });
    const [startTime, setStartTime] = useState<number | null>(null);

    // Update auth state
    useEffect(() => {
        let authState: DiagnosticState["authState"] = "NULL";
        if (loading) authState = "LOADING";
        else if (user) authState = "AUTHENTICATED";

        setState(prev => ({
            ...prev,
            authState,
            pathname,
            renderCount: prev.renderCount + 1,
        }));
    }, [user, loading, pathname]);

    // Navigation start handler
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        setStartTime(now);
        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            lastNavClick: new Date().toISOString().slice(11, 23),
            lastNavTarget: target,
            checkpoints: [{ label: "NAV_START", timestamp: new Date().toISOString().slice(11, 23) }],
            lastFetchTime: null,
        }));
    }, []);

    // Navigation end handler
    const handleNavEnd = useCallback(() => {
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
        }));
    }, []);

    // Checkpoint handler
    const handleCheckpoint = useCallback((label: string) => {
        const now = Date.now();
        const elapsed = startTime ? now - startTime : undefined;
        setState(prev => ({
            ...prev,
            checkpoints: [
                ...prev.checkpoints,
                { label, timestamp: new Date().toISOString().slice(11, 23), elapsed }
            ].slice(-6), // Keep last 6 checkpoints
        }));
    }, [startTime]);

    // Fetch time handler
    const handleFetchTime = useCallback((ms: number) => {
        setState(prev => ({
            ...prev,
            lastFetchTime: ms,
        }));
        handleCheckpoint(`FETCH_DONE (${ms.toFixed(0)}ms)`);
    }, [handleCheckpoint]);

    // Register global handlers
    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        window.__DIAG_NAV_END = handleNavEnd;
        window.__DIAG_CHECKPOINT = handleCheckpoint;
        window.__DIAG_FETCH_TIME = handleFetchTime;
        return () => {
            delete window.__DIAG_NAV_START;
            delete window.__DIAG_NAV_END;
            delete window.__DIAG_CHECKPOINT;
            delete window.__DIAG_FETCH_TIME;
        };
    }, [handleNavStart, handleNavEnd, handleCheckpoint, handleFetchTime]);

    // Auto-reset to IDLE when pathname changes
    useEffect(() => {
        if (startTime) {
            const elapsed = Date.now() - startTime;
            handleCheckpoint(`PAGE_LOADED (+${elapsed}ms)`);
        }
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
        }));
        setStartTime(null);
    }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

    const getColor = (status: string) => {
        switch (status) {
            case "AUTHENTICATED":
            case "IDLE":
                return "text-green-400";
            case "LOADING":
            case "NAVIGATING":
                return "text-yellow-400";
            case "NULL":
                return "text-red-400";
            default:
                return "text-white";
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/95 border border-white/20 rounded-lg p-3 font-mono text-[10px] space-y-1 shadow-2xl min-w-[300px] max-h-[400px] overflow-y-auto">
            <div className="text-white/50 font-bold border-b border-white/10 pb-1 mb-2 flex items-center gap-2">
                🔬 DIAGNOSTIC PROBE v2
                {state.routerStatus === "NAVIGATING" && (
                    <span className="text-yellow-400 animate-pulse">● SCANNING</span>
                )}
            </div>

            {/* Core Status */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-white/40">AUTH:</span>
                <span className={getColor(state.authState)}>{state.authState}</span>

                <span className="text-white/40">ROUTER:</span>
                <span className={getColor(state.routerStatus)}>{state.routerStatus}</span>

                <span className="text-white/40">PATH:</span>
                <span className="text-blue-400 truncate">{state.pathname}</span>
            </div>

            {/* Navigation Info */}
            {state.lastNavClick && (
                <div className="border-t border-white/10 pt-1 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-white/40">CLICK:</span>
                    <span className="text-orange-400">{state.lastNavClick}</span>

                    <span className="text-white/40">TARGET:</span>
                    <span className="text-purple-400 truncate">{state.lastNavTarget}</span>
                </div>
            )}

            {/* Checkpoints */}
            {state.checkpoints.length > 0 && (
                <div className="border-t border-white/10 pt-1 mt-1">
                    <div className="text-white/40 mb-1">CHECKPOINTS:</div>
                    <div className="space-y-0.5 pl-2">
                        {state.checkpoints.map((cp, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                <span className="text-cyan-400">{cp.label}</span>
                                <span className="text-white/30">{cp.timestamp}</span>
                                {cp.elapsed !== undefined && (
                                    <span className="text-yellow-400">(+{cp.elapsed}ms)</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fetch Time */}
            {state.lastFetchTime !== null && (
                <div className="border-t border-white/10 pt-1 mt-1 flex justify-between">
                    <span className="text-white/40">FETCH_TIME:</span>
                    <span className={state.lastFetchTime > 500 ? "text-red-400" : "text-green-400"}>
                        {state.lastFetchTime.toFixed(0)}ms
                    </span>
                </div>
            )}

            {/* Render Count */}
            <div className="border-t border-white/10 pt-1 mt-1 flex justify-between">
                <span className="text-white/40">RENDERS:</span>
                <span className="text-white/30">{state.renderCount}</span>
            </div>
        </div>
    );
}

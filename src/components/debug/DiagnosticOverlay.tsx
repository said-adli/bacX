"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v3 - PASSIVE SCANNER
 * - Network traffic monitor (fetch interceptor)
 * - Transition timeout detector
 * - Smoking gun verdict
 */

interface Checkpoint {
    label: string;
    timestamp: string;
    elapsed?: number;
}

interface NetworkEvent {
    type: "REQUEST" | "RESPONSE" | "ERROR";
    url: string;
    timestamp: string;
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
    networkEvents: NetworkEvent[];
    transitionStartTime: number | null;
    transitionTimeout: boolean;
    verdict: string | null;
}

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_NAV_END?: () => void;
        __DIAG_CHECKPOINT?: (label: string) => void;
        __DIAG_FETCH_TIME?: (ms: number) => void;
        __DIAG_MIDDLEWARE_IN?: () => void;
        __DIAG_MIDDLEWARE_OUT?: () => void;
        __originalFetch?: typeof fetch;
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
        networkEvents: [],
        transitionStartTime: null,
        transitionTimeout: false,
        verdict: null,
    });
    const startTimeRef = useRef<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Fetch interceptor for network monitoring
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Only install once
        if (!window.__originalFetch) {
            window.__originalFetch = window.fetch;

            window.fetch = async (...args) => {
                const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
                const isNextData = url.includes("_next") || url.includes("_rsc") || url.includes("__nextjs");

                if (isNextData) {
                    const ts = new Date().toISOString().slice(11, 23);
                    setState(prev => ({
                        ...prev,
                        networkEvents: [...prev.networkEvents, { type: "REQUEST", url: url.slice(0, 50), timestamp: ts }].slice(-5),
                    }));

                    try {
                        const response = await window.__originalFetch!(...args);
                        setState(prev => ({
                            ...prev,
                            networkEvents: [...prev.networkEvents, { type: "RESPONSE", url: url.slice(0, 50), timestamp: new Date().toISOString().slice(11, 23) }].slice(-5),
                        }));
                        return response;
                    } catch (err) {
                        setState(prev => ({
                            ...prev,
                            networkEvents: [...prev.networkEvents, { type: "ERROR", url: url.slice(0, 50), timestamp: new Date().toISOString().slice(11, 23) }].slice(-5),
                        }));
                        throw err;
                    }
                }

                return window.__originalFetch!(...args);
            };
        }

        return () => {
            // Don't restore - keep interceptor active
        };
    }, []);

    // Navigation start handler with timeout
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        startTimeRef.current = now;

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set 2-second timeout warning
        timeoutRef.current = setTimeout(() => {
            setState(prev => ({
                ...prev,
                transitionTimeout: true,
                verdict: determineVerdict(prev.checkpoints),
            }));
        }, 2000);

        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            lastNavClick: new Date().toISOString().slice(11, 23),
            lastNavTarget: target,
            checkpoints: [{ label: "SIDEBAR_CLICK", timestamp: new Date().toISOString().slice(11, 23) }],
            lastFetchTime: null,
            transitionStartTime: now,
            transitionTimeout: false,
            verdict: null,
            networkEvents: [],
        }));
    }, []);

    // Navigation end handler
    const handleNavEnd = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
            transitionTimeout: false,
        }));
    }, []);

    // Checkpoint handler
    const handleCheckpoint = useCallback((label: string) => {
        const now = Date.now();
        const elapsed = startTimeRef.current ? now - startTimeRef.current : undefined;
        setState(prev => ({
            ...prev,
            checkpoints: [
                ...prev.checkpoints,
                { label, timestamp: new Date().toISOString().slice(11, 23), elapsed }
            ].slice(-8),
        }));
    }, []);

    // Fetch time handler
    const handleFetchTime = useCallback((ms: number) => {
        setState(prev => ({
            ...prev,
            lastFetchTime: ms,
        }));
        handleCheckpoint(`FETCH_DONE (${ms.toFixed(0)}ms)`);
    }, [handleCheckpoint]);

    // Middleware handlers
    const handleMiddlewareIn = useCallback(() => {
        handleCheckpoint("MIDDLEWARE_IN");
    }, [handleCheckpoint]);

    const handleMiddlewareOut = useCallback(() => {
        handleCheckpoint("MIDDLEWARE_OUT");
    }, [handleCheckpoint]);

    // Determine verdict based on checkpoints
    function determineVerdict(checkpoints: Checkpoint[]): string {
        const labels = checkpoints.map(c => c.label);

        if (labels.includes("SIDEBAR_CLICK") && !labels.some(l => l.includes("FETCH"))) {
            return "🔴 BLOCKED AT CLIENT (Router Deadlock)";
        }
        if (labels.includes("MIDDLEWARE_IN") && !labels.includes("MIDDLEWARE_OUT")) {
            return "🟠 BLOCKED AT MIDDLEWARE";
        }
        if (labels.some(l => l.includes("FETCH_START")) && !labels.some(l => l.includes("FETCH_DONE"))) {
            return "🟡 BLOCKED AT PAGE FETCH (Supabase)";
        }
        return "⚪ UNKNOWN - Need more data";
    }

    // Register global handlers
    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        window.__DIAG_NAV_END = handleNavEnd;
        window.__DIAG_CHECKPOINT = handleCheckpoint;
        window.__DIAG_FETCH_TIME = handleFetchTime;
        window.__DIAG_MIDDLEWARE_IN = handleMiddlewareIn;
        window.__DIAG_MIDDLEWARE_OUT = handleMiddlewareOut;
        return () => {
            delete window.__DIAG_NAV_START;
            delete window.__DIAG_NAV_END;
            delete window.__DIAG_CHECKPOINT;
            delete window.__DIAG_FETCH_TIME;
            delete window.__DIAG_MIDDLEWARE_IN;
            delete window.__DIAG_MIDDLEWARE_OUT;
        };
    }, [handleNavStart, handleNavEnd, handleCheckpoint, handleFetchTime, handleMiddlewareIn, handleMiddlewareOut]);

    // Auto-reset when pathname changes
    useEffect(() => {
        if (startTimeRef.current) {
            const elapsed = Date.now() - startTimeRef.current;
            handleCheckpoint(`PAGE_LOADED (+${elapsed}ms)`);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
            transitionTimeout: false,
        }));
        startTimeRef.current = null;
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

    // Calculate elapsed time for display
    const elapsedTime = state.transitionStartTime && state.routerStatus === "NAVIGATING"
        ? Math.floor((Date.now() - state.transitionStartTime) / 100) * 100
        : null;

    return (
        <div className={`fixed bottom-4 right-4 z-[9999] border rounded-lg p-3 font-mono text-[10px] space-y-1 shadow-2xl min-w-[320px] max-h-[450px] overflow-y-auto ${state.transitionTimeout ? "bg-red-950/95 border-red-500/50" : "bg-black/95 border-white/20"}`}>
            <div className="text-white/50 font-bold border-b border-white/10 pb-1 mb-2 flex items-center gap-2">
                🔬 DIAGNOSTIC PROBE v3
                {state.routerStatus === "NAVIGATING" && (
                    <span className={`animate-pulse ${state.transitionTimeout ? "text-red-400" : "text-yellow-400"}`}>
                        ● {state.transitionTimeout ? "TIMEOUT!" : "SCANNING"}
                    </span>
                )}
            </div>

            {/* Core Status */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-white/40">AUTH:</span>
                <span className={getColor(state.authState)}>{state.authState}</span>

                <span className="text-white/40">ROUTER:</span>
                <span className={getColor(state.routerStatus)}>
                    {state.routerStatus}
                    {elapsedTime !== null && <span className="text-white/30 ml-1">({elapsedTime}ms)</span>}
                </span>

                <span className="text-white/40">PATH:</span>
                <span className="text-blue-400 truncate">{state.pathname}</span>
            </div>

            {/* Verdict (if timeout) */}
            {state.transitionTimeout && state.verdict && (
                <div className="border-t border-red-500/30 pt-2 mt-2 text-center">
                    <div className="text-red-400 font-bold text-xs">{state.verdict}</div>
                </div>
            )}

            {/* Network Events */}
            {state.networkEvents.length > 0 && (
                <div className="border-t border-white/10 pt-1 mt-1">
                    <div className="text-white/40 mb-1">NETWORK:</div>
                    <div className="space-y-0.5 pl-2">
                        {state.networkEvents.map((evt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className={evt.type === "REQUEST" ? "text-blue-400" : evt.type === "RESPONSE" ? "text-green-400" : "text-red-400"}>
                                    {evt.type === "REQUEST" ? "↑" : evt.type === "RESPONSE" ? "↓" : "✗"}
                                </span>
                                <span className="text-white/50 truncate max-w-[200px]">{evt.url}</span>
                            </div>
                        ))}
                    </div>
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
                                {cp.elapsed !== undefined && (
                                    <span className="text-yellow-400">(+{cp.elapsed}ms)</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-white/10 pt-1 mt-1 flex justify-between text-white/30">
                <span>RENDERS: {state.renderCount}</span>
                <span>v3-passive</span>
            </div>
        </div>
    );
}

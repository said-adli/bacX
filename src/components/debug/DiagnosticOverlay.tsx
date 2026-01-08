"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v8 - ON-SCREEN DOCTOR'S REPORT
 * - Live timer display
 * - Color-coded critical values
 * - Persistent results across navigation
 */

interface TimerResult {
    label: string;
    duration: number;
    timestamp: number;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    pathname: string;
    renderCount: number;
    timers: TimerResult[];
    heartbeatAlive: boolean;
    verdict: string | null;
    transitionStartTime: number | null;
}

// Global timer storage
const pendingTimers: Record<string, number> = {};

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_CHECKPOINT?: (label: string) => void;
        __DIAG_FETCH_TIME?: (ms: number) => void;
        __DIAG_PROFILE?: (name: string, time: number, phase: string) => void;
        __DIAG_TIMER_START?: (label: string) => void;
        __DIAG_TIMER_END?: (label: string) => void;
        __originalFetch?: typeof fetch;
    }
}

// ============================================================================
// GLOBAL TIMING FUNCTIONS (for use in other components)
// ============================================================================
export function timerStart(label: string) {
    pendingTimers[label] = performance.now();
    if (typeof window !== "undefined" && window.__DIAG_TIMER_START) {
        window.__DIAG_TIMER_START(label);
    }
}

export function timerEnd(label: string) {
    const start = pendingTimers[label];
    if (start) {
        const duration = performance.now() - start;
        delete pendingTimers[label];
        if (typeof window !== "undefined" && window.__DIAG_TIMER_END) {
            window.__DIAG_TIMER_END(label);
        }
        // Also report to global handler
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent('diag-timer', { detail: { label, duration } }));
        }
        return duration;
    }
    return 0;
}

// ============================================================================
// MAIN DIAGNOSTIC OVERLAY
// ============================================================================
export function DiagnosticOverlay() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [state, setState] = useState<DiagnosticState>({
        authState: "LOADING",
        routerStatus: "IDLE",
        pathname: "",
        renderCount: 0,
        timers: [],
        heartbeatAlive: true,
        verdict: null,
        transitionStartTime: null,
    });

    const startTimeRef = useRef<number | null>(null);
    const heartbeatRef = useRef<number>(Date.now());

    // =========================================================================
    // AUTH STATE TRACKING
    // =========================================================================
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

    // =========================================================================
    // TIMER EVENT LISTENER
    // =========================================================================
    useEffect(() => {
        const handleTimer = (e: CustomEvent<{ label: string; duration: number }>) => {
            const { label, duration } = e.detail;
            setState(prev => {
                // Update or add timer result
                const existing = prev.timers.findIndex(t => t.label === label);
                const newTimer: TimerResult = { label, duration, timestamp: Date.now() };

                let newTimers: TimerResult[];
                if (existing >= 0) {
                    newTimers = [...prev.timers];
                    newTimers[existing] = newTimer;
                } else {
                    newTimers = [...prev.timers, newTimer].slice(-10);
                }

                // Determine verdict based on slowest timer
                const slowest = newTimers.reduce((a, b) => a.duration > b.duration ? a : b, { label: "", duration: 0 });
                const verdict = slowest.duration > 100
                    ? `🔴 CRITICAL: ${slowest.label} (${slowest.duration.toFixed(0)}ms)`
                    : slowest.duration > 50
                        ? `🟠 SLOW: ${slowest.label} (${slowest.duration.toFixed(0)}ms)`
                        : null;

                return {
                    ...prev,
                    timers: newTimers,
                    verdict,
                };
            });
        };

        window.addEventListener('diag-timer', handleTimer as EventListener);
        return () => window.removeEventListener('diag-timer', handleTimer as EventListener);
    }, []);

    // =========================================================================
    // MAIN THREAD HEARTBEAT
    // =========================================================================
    useEffect(() => {
        let animationFrameId: number;

        const heartbeat = () => {
            const now = Date.now();
            const delta = now - heartbeatRef.current;
            heartbeatRef.current = now;

            const frozen = delta > 100;

            setState(prev => ({
                ...prev,
                heartbeatAlive: !frozen,
                ...(frozen && prev.routerStatus === "NAVIGATING" ? {
                    verdict: `🔴 THREAD FROZEN: ${delta}ms`,
                } : {}),
            }));

            animationFrameId = requestAnimationFrame(heartbeat);
        };

        animationFrameId = requestAnimationFrame(heartbeat);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // =========================================================================
    // NAVIGATION HANDLERS
    // =========================================================================
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        startTimeRef.current = now;

        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            transitionStartTime: now,
        }));
    }, []);

    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        return () => { delete window.__DIAG_NAV_START; };
    }, [handleNavStart]);

    // Reset router status on pathname change
    useEffect(() => {
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
        }));
        startTimeRef.current = null;
    }, [pathname]);

    // =========================================================================
    // CLEAR FUNCTION
    // =========================================================================
    const clearTimers = () => {
        setState(prev => ({
            ...prev,
            timers: [],
            verdict: null,
        }));
    };

    // =========================================================================
    // GET COLOR FOR DURATION
    // =========================================================================
    const getColor = (duration: number) => {
        if (duration > 100) return { bg: "bg-red-500/20", text: "text-red-400", flash: true };
        if (duration > 50) return { bg: "bg-yellow-500/20", text: "text-yellow-400", flash: false };
        return { bg: "bg-green-500/20", text: "text-green-400", flash: false };
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    const elapsed = state.transitionStartTime && state.routerStatus === "NAVIGATING"
        ? Date.now() - state.transitionStartTime
        : null;

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black border border-white/30 rounded-lg p-4 font-mono text-xs shadow-2xl min-w-[320px] max-h-[500px] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span className="text-white font-bold text-sm">🩺 DOCTOR'S REPORT v8</span>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state.heartbeatAlive ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
                    {state.routerStatus === "NAVIGATING" && (
                        <span className="text-yellow-400 animate-pulse">{elapsed}ms</span>
                    )}
                </div>
            </div>

            {/* Status Row */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                <div className="bg-white/5 rounded px-2 py-1">
                    <span className="text-white/50">AUTH:</span>{" "}
                    <span className={state.authState === "LOADING" ? "text-yellow-400" : state.authState === "AUTHENTICATED" ? "text-green-400" : "text-red-400"}>
                        {state.authState}
                    </span>
                </div>
                <div className="bg-white/5 rounded px-2 py-1">
                    <span className="text-white/50">ROUTER:</span>{" "}
                    <span className={state.routerStatus === "NAVIGATING" ? "text-yellow-400" : "text-green-400"}>
                        {state.routerStatus}
                    </span>
                </div>
            </div>

            {/* Verdict Banner */}
            {state.verdict && (
                <div className={`mb-3 p-2 rounded text-center font-bold ${state.verdict.includes('CRITICAL') ? 'bg-red-500/30 text-red-400 animate-pulse' : state.verdict.includes('SLOW') ? 'bg-yellow-500/30 text-yellow-400' : 'bg-blue-500/30 text-blue-400'}`}>
                    {state.verdict}
                </div>
            )}

            {/* Timer Results */}
            <div className="space-y-1 mb-3">
                <div className="text-white/50 text-[10px] uppercase tracking-wider mb-1">TIMING RESULTS:</div>
                {state.timers.length === 0 ? (
                    <div className="text-white/30 text-center py-2">Click a link to capture timings...</div>
                ) : (
                    state.timers.sort((a, b) => b.duration - a.duration).map((timer, i) => {
                        const color = getColor(timer.duration);
                        return (
                            <div
                                key={timer.label}
                                className={`flex items-center justify-between px-2 py-1.5 rounded ${color.bg} ${color.flash ? 'animate-pulse' : ''}`}
                            >
                                <span className="text-white/80">{timer.label.replace('🔴 ', '')}</span>
                                <span className={`font-bold ${color.text}`}>
                                    {timer.duration.toFixed(1)}ms
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Clear Button */}
            <button
                onClick={clearTimers}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-white/70 hover:text-white transition-colors text-[10px] uppercase tracking-wider"
            >
                Reset Report
            </button>

            {/* Footer */}
            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[9px] text-white/30">
                <span>PATH: {state.pathname}</span>
                <span>v8</span>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v9 - GHOST PERSISTENCE
 * - LocalStorage persistence
 * - TOTAL_WAIT_TIME tracker
 * - Force visibility on >3s wait
 * - Network interceptor for pending requests
 */

interface TimerResult {
    label: string;
    duration: number;
    timestamp: number;
}

interface PendingFetch {
    url: string;
    startTime: number;
    resolved: boolean;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    pathname: string;
    renderCount: number;
    timers: TimerResult[];
    pendingFetches: PendingFetch[];
    totalWaitTime: number | null;
    waitStartTime: number | null;
    criticalAlert: boolean;
}

const STORAGE_KEY = 'diag_probe_v9';

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_CHECKPOINT?: (label: string) => void;
        __DIAG_FETCH_TIME?: (ms: number) => void;
        __DIAG_PROFILE?: (name: string, time: number, phase: string) => void;
        __originalFetch?: typeof fetch;
    }
}

// ============================================================================
// MAIN DIAGNOSTIC OVERLAY
// ============================================================================
export function DiagnosticOverlay() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [state, setState] = useState<DiagnosticState>(() => {
        // Load from localStorage on init
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return {
                        ...parsed,
                        routerStatus: "IDLE",
                        waitStartTime: null,
                    };
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        return {
            authState: "LOADING",
            routerStatus: "IDLE",
            pathname: "",
            renderCount: 0,
            timers: [],
            pendingFetches: [],
            totalWaitTime: null,
            waitStartTime: null,
            criticalAlert: false,
        };
    });

    const waitStartRef = useRef<number | null>(null);
    const navigationTarget = useRef<string | null>(null);

    // =========================================================================
    // SAVE TO LOCALSTORAGE ON STATE CHANGE
    // =========================================================================
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    timers: state.timers,
                    totalWaitTime: state.totalWaitTime,
                    pendingFetches: state.pendingFetches,
                    criticalAlert: state.criticalAlert,
                    authState: state.authState,
                    pathname: state.pathname,
                }));
            } catch (e) {
                // Ignore storage errors
            }
        }
    }, [state.timers, state.totalWaitTime, state.pendingFetches, state.criticalAlert, state.authState, state.pathname]);

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
    // FETCH INTERCEPTOR FOR PENDING REQUESTS
    // =========================================================================
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!window.__originalFetch) {
            window.__originalFetch = window.fetch;

            window.fetch = async (...args) => {
                const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
                const shortUrl = url.slice(0, 50);
                const startTime = Date.now();

                // Add to pending
                setState(prev => ({
                    ...prev,
                    pendingFetches: [...prev.pendingFetches, { url: shortUrl, startTime, resolved: false }].slice(-5),
                }));

                try {
                    const response = await window.__originalFetch!(...args);

                    // Mark as resolved
                    setState(prev => ({
                        ...prev,
                        pendingFetches: prev.pendingFetches.map(f =>
                            f.url === shortUrl && f.startTime === startTime ? { ...f, resolved: true } : f
                        ),
                    }));

                    return response;
                } catch (err) {
                    setState(prev => ({
                        ...prev,
                        pendingFetches: prev.pendingFetches.map(f =>
                            f.url === shortUrl && f.startTime === startTime ? { ...f, resolved: true } : f
                        ),
                    }));
                    throw err;
                }
            };
        }
    }, []);

    // =========================================================================
    // TIMER EVENT LISTENER
    // =========================================================================
    useEffect(() => {
        const handleTimer = (e: CustomEvent<{ label: string; duration: number }>) => {
            const { label, duration } = e.detail;
            setState(prev => {
                const existing = prev.timers.findIndex(t => t.label === label);
                const newTimer: TimerResult = { label, duration, timestamp: Date.now() };

                let newTimers: TimerResult[];
                if (existing >= 0) {
                    newTimers = [...prev.timers];
                    newTimers[existing] = newTimer;
                } else {
                    newTimers = [...prev.timers, newTimer].slice(-10);
                }

                return { ...prev, timers: newTimers };
            });
        };

        window.addEventListener('diag-timer', handleTimer as EventListener);
        return () => window.removeEventListener('diag-timer', handleTimer as EventListener);
    }, []);

    // =========================================================================
    // NAVIGATION START HANDLER - TOTAL WAIT TIME START
    // =========================================================================
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        waitStartRef.current = now;
        navigationTarget.current = target;

        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            waitStartTime: now,
            totalWaitTime: null,
            criticalAlert: false,
            pendingFetches: [],
        }));
    }, []);

    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        return () => { delete window.__DIAG_NAV_START; };
    }, [handleNavStart]);

    // =========================================================================
    // NAVIGATION END - TOTAL WAIT TIME STOP
    // =========================================================================
    useEffect(() => {
        if (waitStartRef.current && navigationTarget.current) {
            const totalWait = Date.now() - waitStartRef.current;
            const isCritical = totalWait > 3000;

            setState(prev => ({
                ...prev,
                routerStatus: "IDLE",
                totalWaitTime: totalWait,
                criticalAlert: isCritical,
                timers: [
                    ...prev.timers.filter(t => t.label !== 'TOTAL_WAIT_TIME'),
                    { label: 'TOTAL_WAIT_TIME', duration: totalWait, timestamp: Date.now() }
                ],
            }));

            waitStartRef.current = null;
            navigationTarget.current = null;
        }
    }, [pathname]);

    // =========================================================================
    // LIVE ELAPSED COUNTER
    // =========================================================================
    const [liveElapsed, setLiveElapsed] = useState(0);
    useEffect(() => {
        if (state.routerStatus !== "NAVIGATING" || !state.waitStartTime) {
            return;
        }

        const interval = setInterval(() => {
            setLiveElapsed(Date.now() - state.waitStartTime!);
        }, 100);

        return () => clearInterval(interval);
    }, [state.routerStatus, state.waitStartTime]);

    // =========================================================================
    // CLEAR FUNCTION
    // =========================================================================
    const clearTimers = () => {
        setState(prev => ({
            ...prev,
            timers: [],
            totalWaitTime: null,
            pendingFetches: [],
            criticalAlert: false,
        }));
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    // =========================================================================
    // GET COLOR FOR DURATION
    // =========================================================================
    const getColor = (duration: number) => {
        if (duration > 100) return { bg: "bg-red-500/30", text: "text-red-400", flash: true };
        if (duration > 50) return { bg: "bg-yellow-500/30", text: "text-yellow-400", flash: false };
        return { bg: "bg-green-500/20", text: "text-green-400", flash: false };
    };

    // =========================================================================
    // CHECK FOR STALE FETCHES
    // =========================================================================
    const staleFetches = state.pendingFetches.filter(f => !f.resolved && (Date.now() - f.startTime) > 2000);

    // =========================================================================
    // RENDER
    // =========================================================================
    const isNavigating = state.routerStatus === "NAVIGATING";
    const bgColor = state.criticalAlert
        ? "bg-red-900 border-red-500"
        : isNavigating && liveElapsed > 3000
            ? "bg-red-900 border-red-500 animate-pulse"
            : "bg-black border-white/30";

    return (
        <div className={`fixed bottom-4 left-4 z-[9999] ${bgColor} border-2 rounded-lg p-4 font-mono text-xs shadow-2xl min-w-[350px] max-h-[550px] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span className="text-white font-bold text-sm">👻 GHOST PERSISTENCE v9</span>
                {isNavigating && (
                    <span className={`font-bold ${liveElapsed > 3000 ? 'text-red-400 animate-pulse text-lg' : liveElapsed > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(liveElapsed / 1000).toFixed(1)}s
                    </span>
                )}
            </div>

            {/* TOTAL WAIT TIME - Hero Display */}
            {state.totalWaitTime !== null && (
                <div className={`mb-3 p-3 rounded-lg text-center ${state.totalWaitTime > 3000 ? 'bg-red-500/50 animate-pulse' : state.totalWaitTime > 1000 ? 'bg-yellow-500/30' : 'bg-green-500/20'}`}>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider">TOTAL WAIT TIME</div>
                    <div className={`text-2xl font-bold ${state.totalWaitTime > 3000 ? 'text-red-400' : state.totalWaitTime > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(state.totalWaitTime / 1000).toFixed(2)}s
                    </div>
                </div>
            )}

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
                    <span className={isNavigating ? "text-yellow-400 animate-pulse" : "text-green-400"}>
                        {state.routerStatus}
                    </span>
                </div>
            </div>

            {/* Pending Fetches Warning */}
            {staleFetches.length > 0 && (
                <div className="mb-3 p-2 bg-orange-500/30 rounded text-orange-400 text-[10px]">
                    <div className="font-bold mb-1">⚠️ STALE REQUESTS ({'>'}2s):</div>
                    {staleFetches.map((f, i) => (
                        <div key={i} className="truncate">{f.url}</div>
                    ))}
                </div>
            )}

            {/* Timer Results */}
            <div className="space-y-1 mb-3">
                <div className="text-white/50 text-[10px] uppercase tracking-wider mb-1">TIMING RESULTS:</div>
                {state.timers.length === 0 ? (
                    <div className="text-white/30 text-center py-2">No results saved...</div>
                ) : (
                    state.timers.sort((a, b) => b.duration - a.duration).map((timer) => {
                        const color = getColor(timer.duration);
                        return (
                            <div
                                key={timer.label}
                                className={`flex items-center justify-between px-2 py-1.5 rounded ${color.bg} ${color.flash ? 'animate-pulse' : ''}`}
                            >
                                <span className="text-white/80">{timer.label}</span>
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
                <span>💾 Saved to localStorage</span>
            </div>
        </div>
    );
}

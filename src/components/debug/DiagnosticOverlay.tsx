"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v10 - AUTO-SURGEON
 * - Automatic file resolver
 * - Middleware tracer
 * - Server component sniper
 * - Critical path display
 */

interface TimerResult {
    label: string;
    duration: number;
    timestamp: number;
    source?: string;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    pathname: string;
    renderCount: number;
    timers: TimerResult[];
    totalWaitTime: number | null;
    waitStartTime: number | null;
    criticalAlert: boolean;
    culpritFile: string | null;
    culpritReason: string | null;
    stuckIn: string | null;
    targetRoute: string | null;
    segments: string[];
    middlewareHit: boolean;
    pageRendered: boolean;
}

const STORAGE_KEY = 'diag_probe_v10';

// Route to file mapping
const ROUTE_FILE_MAP: Record<string, string> = {
    '/dashboard': 'src/app/(dashboard)/page.tsx',
    '/profile': 'src/app/(dashboard)/profile/page.tsx',
    '/subscription': 'src/app/(dashboard)/subscription/page.tsx',
    '/subjects': 'src/app/(dashboard)/subjects/page.tsx',
    '/admin': 'src/app/(dashboard)/admin/page.tsx',
    '/live': 'src/app/(dashboard)/live/page.tsx',
};

// Checkpoint phases
type Phase = 'CLICK' | 'MIDDLEWARE' | 'LAYOUT' | 'PAGE' | 'RENDER' | 'DONE';

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_CHECKPOINT?: (phase: string, source?: string) => void;
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
    const segments = useSelectedLayoutSegments();
    const { user, loading } = useAuth();

    const [state, setState] = useState<DiagnosticState>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    return {
                        ...parsed,
                        routerStatus: "IDLE",
                        waitStartTime: null,
                        segments: [],
                    };
                }
            } catch (e) { }
        }
        return {
            authState: "LOADING",
            routerStatus: "IDLE",
            pathname: "",
            renderCount: 0,
            timers: [],
            totalWaitTime: null,
            waitStartTime: null,
            criticalAlert: false,
            culpritFile: null,
            culpritReason: null,
            stuckIn: null,
            targetRoute: null,
            segments: [],
            middlewareHit: false,
            pageRendered: false,
        };
    });

    const waitStartRef = useRef<number | null>(null);
    const navigationTarget = useRef<string | null>(null);
    const checkpointsRef = useRef<{ phase: string; time: number; source?: string }[]>([]);

    // =========================================================================
    // SAVE TO LOCALSTORAGE
    // =========================================================================
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    timers: state.timers,
                    totalWaitTime: state.totalWaitTime,
                    criticalAlert: state.criticalAlert,
                    culpritFile: state.culpritFile,
                    culpritReason: state.culpritReason,
                    stuckIn: state.stuckIn,
                    pathname: state.pathname,
                }));
            } catch (e) { }
        }
    }, [state.timers, state.totalWaitTime, state.criticalAlert, state.culpritFile, state.culpritReason, state.stuckIn, state.pathname]);

    // =========================================================================
    // AUTH STATE
    // =========================================================================
    useEffect(() => {
        let authState: DiagnosticState["authState"] = "NULL";
        if (loading) authState = "LOADING";
        else if (user) authState = "AUTHENTICATED";

        setState(prev => ({
            ...prev,
            authState,
            pathname,
            segments,
            renderCount: prev.renderCount + 1,
        }));
    }, [user, loading, pathname, segments]);

    // =========================================================================
    // TIMER LISTENER
    // =========================================================================
    useEffect(() => {
        const handleTimer = (e: CustomEvent<{ label: string; duration: number; source?: string }>) => {
            const { label, duration, source } = e.detail;
            setState(prev => {
                const existing = prev.timers.findIndex(t => t.label === label);
                const newTimer: TimerResult = { label, duration, timestamp: Date.now(), source };

                let newTimers: TimerResult[];
                if (existing >= 0) {
                    newTimers = [...prev.timers];
                    newTimers[existing] = newTimer;
                } else {
                    newTimers = [...prev.timers, newTimer].slice(-12);
                }

                return { ...prev, timers: newTimers };
            });
        };

        window.addEventListener('diag-timer', handleTimer as EventListener);
        return () => window.removeEventListener('diag-timer', handleTimer as EventListener);
    }, []);

    // =========================================================================
    // NAVIGATION START
    // =========================================================================
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        waitStartRef.current = now;
        navigationTarget.current = target;
        checkpointsRef.current = [{ phase: 'CLICK', time: now }];

        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            waitStartTime: now,
            totalWaitTime: null,
            criticalAlert: false,
            culpritFile: null,
            culpritReason: null,
            stuckIn: null,
            targetRoute: target,
            middlewareHit: false,
            pageRendered: false,
        }));
    }, []);

    // =========================================================================
    // CHECKPOINT HANDLER
    // =========================================================================
    const handleCheckpoint = useCallback((phase: string, source?: string) => {
        const now = Date.now();
        checkpointsRef.current.push({ phase, time: now, source });

        setState(prev => {
            if (phase === 'MIDDLEWARE_IN') {
                return { ...prev, middlewareHit: true };
            }
            if (phase === 'PAGE_RENDER') {
                return { ...prev, pageRendered: true };
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        window.__DIAG_CHECKPOINT = handleCheckpoint;
        return () => {
            delete window.__DIAG_NAV_START;
            delete window.__DIAG_CHECKPOINT;
        };
    }, [handleNavStart, handleCheckpoint]);

    // =========================================================================
    // NAVIGATION END - DETERMINE CULPRIT
    // =========================================================================
    useEffect(() => {
        if (waitStartRef.current && navigationTarget.current) {
            const totalWait = Date.now() - waitStartRef.current;
            const target = navigationTarget.current;
            const checkpoints = checkpointsRef.current;

            // Determine culprit
            let culpritFile: string | null = null;
            let culpritReason: string | null = null;
            let stuckIn: string | null = null;

            if (totalWait > 3000) {
                // Analyze checkpoints to find the gap
                const phases = checkpoints.map(c => c.phase);

                if (!phases.includes('MIDDLEWARE_IN')) {
                    stuckIn = 'middleware.ts';
                    culpritReason = 'Navigation blocked BEFORE middleware';
                    culpritFile = 'src/middleware.ts or Next.js Router';
                } else if (!phases.includes('PAGE_RENDER')) {
                    // Resolve target to file
                    const baseRoute = target.split('/').slice(0, 3).join('/');
                    culpritFile = ROUTE_FILE_MAP[baseRoute] || `src/app/(dashboard)${target}/page.tsx`;

                    if (target.includes('/subject/')) {
                        culpritFile = 'src/app/(dashboard)/subject/[id]/page.tsx';
                        culpritReason = 'Page component not rendering - check useAuth or data fetch';
                    } else {
                        culpritReason = 'Layout or Page blocked - check if (loading) return guards';
                    }
                } else {
                    culpritFile = 'src/app/(dashboard)/layout.tsx';
                    culpritReason = 'Client hydration or context re-render';
                }
            }

            setState(prev => ({
                ...prev,
                routerStatus: "IDLE",
                totalWaitTime: totalWait,
                criticalAlert: totalWait > 3000,
                culpritFile,
                culpritReason,
                stuckIn,
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
    // LIVE ELAPSED
    // =========================================================================
    const [liveElapsed, setLiveElapsed] = useState(0);
    useEffect(() => {
        if (state.routerStatus !== "NAVIGATING" || !state.waitStartTime) return;
        const interval = setInterval(() => {
            setLiveElapsed(Date.now() - state.waitStartTime!);
        }, 100);
        return () => clearInterval(interval);
    }, [state.routerStatus, state.waitStartTime]);

    // =========================================================================
    // CLEAR
    // =========================================================================
    const clearTimers = () => {
        setState(prev => ({
            ...prev,
            timers: [],
            totalWaitTime: null,
            criticalAlert: false,
            culpritFile: null,
            culpritReason: null,
            stuckIn: null,
        }));
        localStorage.removeItem(STORAGE_KEY);
    };

    // =========================================================================
    // COLORS
    // =========================================================================
    const getColor = (duration: number) => {
        if (duration > 100) return { bg: "bg-red-500/30", text: "text-red-400", flash: true };
        if (duration > 50) return { bg: "bg-yellow-500/30", text: "text-yellow-400", flash: false };
        return { bg: "bg-green-500/20", text: "text-green-400", flash: false };
    };

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
        <div className={`fixed bottom-4 left-4 z-[9999] ${bgColor} border-2 rounded-lg p-4 font-mono text-xs shadow-2xl min-w-[380px] max-h-[600px] overflow-y-auto`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span className="text-white font-bold text-sm">🔪 AUTO-SURGEON v10</span>
                {isNavigating && (
                    <span className={`font-bold ${liveElapsed > 3000 ? 'text-red-400 animate-pulse text-lg' : liveElapsed > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(liveElapsed / 1000).toFixed(1)}s
                    </span>
                )}
            </div>

            {/* CULPRIT DISPLAY - THE SMOKING GUN */}
            {state.criticalAlert && (state.culpritFile || state.stuckIn) && (
                <div className="mb-3 p-3 bg-red-500/40 border-2 border-red-500 rounded-lg animate-pulse">
                    <div className="text-red-300 text-[10px] uppercase tracking-wider mb-1">🎯 THE CULPRIT IS:</div>
                    <div className="text-white font-bold text-sm break-all">
                        {state.stuckIn || state.culpritFile}
                    </div>
                    {state.culpritReason && (
                        <div className="text-red-200 text-[10px] mt-1">
                            Reason: {state.culpritReason}
                        </div>
                    )}
                </div>
            )}

            {/* TOTAL WAIT TIME */}
            {state.totalWaitTime !== null && (
                <div className={`mb-3 p-3 rounded-lg text-center ${state.totalWaitTime > 3000 ? 'bg-red-500/50' : state.totalWaitTime > 1000 ? 'bg-yellow-500/30' : 'bg-green-500/20'}`}>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider">TOTAL WAIT TIME</div>
                    <div className={`text-2xl font-bold ${state.totalWaitTime > 3000 ? 'text-red-400' : state.totalWaitTime > 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(state.totalWaitTime / 1000).toFixed(2)}s
                    </div>
                </div>
            )}

            {/* Route Info */}
            <div className="mb-3 p-2 bg-white/5 rounded text-[10px]">
                <div className="grid grid-cols-2 gap-1">
                    <span className="text-white/40">Target:</span>
                    <span className="text-blue-400 truncate">{state.targetRoute || state.pathname}</span>
                    <span className="text-white/40">Segments:</span>
                    <span className="text-purple-400">{state.segments.join(' → ') || 'root'}</span>
                    <span className="text-white/40">Auth:</span>
                    <span className={state.authState === "LOADING" ? "text-yellow-400" : "text-green-400"}>{state.authState}</span>
                </div>
            </div>

            {/* Status Flags */}
            <div className="flex gap-2 mb-3 text-[10px]">
                <div className={`px-2 py-1 rounded ${state.middlewareHit ? 'bg-green-500/30 text-green-400' : 'bg-gray-500/30 text-gray-400'}`}>
                    MW: {state.middlewareHit ? '✓' : '?'}
                </div>
                <div className={`px-2 py-1 rounded ${state.pageRendered ? 'bg-green-500/30 text-green-400' : 'bg-gray-500/30 text-gray-400'}`}>
                    PAGE: {state.pageRendered ? '✓' : '?'}
                </div>
            </div>

            {/* Timer Results */}
            <div className="space-y-1 mb-3">
                <div className="text-white/50 text-[10px] uppercase tracking-wider mb-1">TIMING BREAKDOWN:</div>
                {state.timers.length === 0 ? (
                    <div className="text-white/30 text-center py-2">Click a link...</div>
                ) : (
                    state.timers.sort((a, b) => b.duration - a.duration).map((timer) => {
                        const color = getColor(timer.duration);
                        return (
                            <div
                                key={timer.label}
                                className={`flex items-center justify-between px-2 py-1.5 rounded ${color.bg} ${color.flash ? 'animate-pulse' : ''}`}
                            >
                                <div>
                                    <span className="text-white/80">{timer.label}</span>
                                    {timer.source && <span className="text-white/40 text-[9px] ml-1">({timer.source})</span>}
                                </div>
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
            <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-white/30">
                💾 Persisted | v10
            </div>
        </div>
    );
}

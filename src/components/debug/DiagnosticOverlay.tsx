"use client";

import { useEffect, useState, useCallback, useRef, Profiler, ProfilerOnRenderCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v6 - DNA CULPRIT HUNTER
 * - React.Profiler integration
 * - Component timing table
 * - Performance mark tracking
 * - Smoking gun detector
 */

interface ComponentTiming {
    name: string;
    renderTime: number;
    phase: "mount" | "update";
    timestamp: number;
}

interface JsError {
    message: string;
    timestamp: string;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    routerStatus: "IDLE" | "NAVIGATING";
    pathname: string;
    renderCount: number;
    componentTimings: ComponentTiming[];
    jsErrors: JsError[];
    heartbeatAlive: boolean;
    verdict: string | null;
    transitionStartTime: number | null;
    slowestComponent: string | null;
    slowestTime: number;
}

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
// PROFILER WRAPPER COMPONENT
// ============================================================================
export function ProfiledComponent({
    id,
    children
}: {
    id: string;
    children: React.ReactNode;
}) {
    const onRender: ProfilerOnRenderCallback = useCallback((
        id,
        phase,
        actualDuration,
    ) => {
        // Report to global handler
        if (typeof window !== "undefined" && window.__DIAG_PROFILE) {
            window.__DIAG_PROFILE(id, actualDuration, phase);
        }

        // Log slow renders
        if (actualDuration > 16) {
            console.warn(`[PROFILER] ${id} took ${actualDuration.toFixed(1)}ms (${phase})`);
        }
    }, []);

    return (
        <Profiler id={id} onRender={onRender}>
            {children}
        </Profiler>
    );
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
        componentTimings: [],
        jsErrors: [],
        heartbeatAlive: true,
        verdict: null,
        transitionStartTime: null,
        slowestComponent: null,
        slowestTime: 0,
    });

    const startTimeRef = useRef<number | null>(null);
    const heartbeatRef = useRef<number>(Date.now());
    const frameRef = useRef<number>(0);

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
    // PROFILER HANDLER
    // =========================================================================
    const handleProfile = useCallback((name: string, time: number, phase: string) => {
        const timing: ComponentTiming = {
            name,
            renderTime: time,
            phase: phase as "mount" | "update",
            timestamp: Date.now(),
        };

        setState(prev => {
            // Keep last 10 timings per component
            const newTimings = [...prev.componentTimings.filter(t => t.name !== name).slice(-9), timing];

            // Find slowest
            const slowest = newTimings.reduce((a, b) => a.renderTime > b.renderTime ? a : b, { name: "", renderTime: 0 } as ComponentTiming);

            return {
                ...prev,
                componentTimings: newTimings,
                slowestComponent: slowest.renderTime > 16 ? slowest.name : prev.slowestComponent,
                slowestTime: Math.max(slowest.renderTime, prev.slowestTime),
                // Update verdict if component is very slow
                ...(time > 50 ? {
                    verdict: `🔴 SLOW COMPONENT: ${name} (${time.toFixed(0)}ms)`,
                } : {}),
            };
        });
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
                    verdict: `🔴 CLIENT_FREEZE: Thread blocked ${delta}ms`,
                } : {}),
            }));

            frameRef.current++;
            animationFrameId = requestAnimationFrame(heartbeat);
        };

        animationFrameId = requestAnimationFrame(heartbeat);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // =========================================================================
    // ERROR CATCHER
    // =========================================================================
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            setState(prev => ({
                ...prev,
                jsErrors: [...prev.jsErrors, { message: event.message.slice(0, 50), timestamp: new Date().toISOString().slice(11, 19) }].slice(-3),
            }));
        };

        const handleRejection = (event: PromiseRejectionEvent) => {
            const msg = event.reason?.message || String(event.reason).slice(0, 50);
            setState(prev => ({
                ...prev,
                jsErrors: [...prev.jsErrors, { message: msg, timestamp: new Date().toISOString().slice(11, 19) }].slice(-3),
            }));
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleRejection);
        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleRejection);
        };
    }, []);

    // =========================================================================
    // NAVIGATION HANDLERS
    // =========================================================================
    const handleNavStart = useCallback((target: string) => {
        const now = Date.now();
        startTimeRef.current = now;

        console.log(`[NAV] Start: ${target}`);

        setState(prev => ({
            ...prev,
            routerStatus: "NAVIGATING",
            transitionStartTime: now,
            verdict: null,
            componentTimings: [],
            slowestComponent: null,
            slowestTime: 0,
        }));
    }, []);

    // Register global handlers
    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        window.__DIAG_PROFILE = handleProfile;
        return () => {
            delete window.__DIAG_NAV_START;
            delete window.__DIAG_PROFILE;
        };
    }, [handleNavStart, handleProfile]);

    // Reset on successful navigation
    useEffect(() => {
        if (startTimeRef.current) {
            const elapsed = Date.now() - startTimeRef.current;
            console.log(`[NAV] Complete: ${elapsed}ms`);
        }
        setState(prev => ({
            ...prev,
            routerStatus: "IDLE",
        }));
        startTimeRef.current = null;
    }, [pathname]);

    // =========================================================================
    // GET COMPONENT STATUS
    // =========================================================================
    const getStatus = (time: number) => {
        if (time > 50) return { icon: "🔴", label: "CRITICAL", color: "text-red-400" };
        if (time > 16) return { icon: "🟠", label: "SLOW", color: "text-orange-400" };
        return { icon: "🟢", label: "OK", color: "text-green-400" };
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    const elapsed = state.transitionStartTime && state.routerStatus === "NAVIGATING"
        ? Date.now() - state.transitionStartTime
        : null;

    // Get unique components with their latest timing
    const componentTable = state.componentTimings.reduce((acc, t) => {
        acc[t.name] = t;
        return acc;
    }, {} as Record<string, ComponentTiming>);

    return (
        <div className={`fixed bottom-4 right-4 z-[9999] border rounded-lg p-3 font-mono text-[10px] space-y-1 shadow-2xl min-w-[360px] max-h-[500px] overflow-y-auto ${state.verdict ? "bg-red-950/95 border-red-500/50" : "bg-black/95 border-white/20"}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-2">
                <span className="text-white/50 font-bold">🧬 DNA HUNTER v6</span>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state.heartbeatAlive ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
                    {state.routerStatus === "NAVIGATING" && (
                        <span className="text-yellow-400 animate-pulse">● {elapsed}ms</span>
                    )}
                </div>
            </div>

            {/* Core Status */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
                <span className="text-white/40">AUTH:</span>
                <span className={state.authState === "LOADING" ? "text-yellow-400" : state.authState === "AUTHENTICATED" ? "text-green-400" : "text-red-400"}>
                    {state.authState}
                </span>
                <span className="text-white/40">ROUTER:</span>
                <span className={state.routerStatus === "NAVIGATING" ? "text-yellow-400" : "text-green-400"}>
                    {state.routerStatus}
                </span>
            </div>

            {/* Verdict */}
            {state.verdict && (
                <div className="border-t border-red-500/30 pt-2 mt-2 animate-pulse">
                    <div className="text-red-400 font-bold text-xs">{state.verdict}</div>
                </div>
            )}

            {/* Component Timing Table */}
            {Object.keys(componentTable).length > 0 && (
                <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="text-white/50 font-bold mb-1">COMPONENT RENDER TIMES:</div>
                    <table className="w-full text-[9px]">
                        <thead>
                            <tr className="text-white/30">
                                <th className="text-left py-0.5">Component</th>
                                <th className="text-right py-0.5">Time</th>
                                <th className="text-right py-0.5">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(componentTable).sort((a, b) => b.renderTime - a.renderTime).map(t => {
                                const status = getStatus(t.renderTime);
                                return (
                                    <tr key={t.name} className={status.color}>
                                        <td className="py-0.5">{t.name}</td>
                                        <td className="text-right">{t.renderTime.toFixed(1)}ms</td>
                                        <td className="text-right">{status.icon} {status.label}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* JavaScript Errors */}
            {state.jsErrors.length > 0 && (
                <div className="border-t border-red-500/30 pt-1 mt-1">
                    <div className="text-red-400 mb-1">JS ERRORS:</div>
                    <div className="space-y-0.5 pl-2">
                        {state.jsErrors.map((err, i) => (
                            <div key={i} className="text-red-300 text-[9px] truncate">
                                <span className="text-red-500">{err.timestamp}</span> {err.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="border-t border-white/10 pt-1 mt-1 flex justify-between text-white/30">
                <span>RENDERS: {state.renderCount}</span>
                <span>v6-dna</span>
            </div>
        </div>
    );
}

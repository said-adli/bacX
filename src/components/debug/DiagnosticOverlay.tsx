"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * DIAGNOSTIC OVERLAY v5 - MRI MODE
 * - RSC Stream Monitor (pending requests)
 * - Main Thread Heartbeat (freeze detection)
 * - Silent Error Catcher
 * - Context Tracer
 * - Verdict Engine
 */

interface PendingRequest {
    url: string;
    startTime: number;
    resolved: boolean;
}

interface JsError {
    message: string;
    timestamp: string;
}

interface DiagnosticState {
    authState: "LOADING" | "AUTHENTICATED" | "NULL";
    authChanges: number;
    routerStatus: "IDLE" | "NAVIGATING";
    pathname: string;
    renderCount: number;
    pendingRequests: PendingRequest[];
    jsErrors: JsError[];
    heartbeatAlive: boolean;
    lastHeartbeat: number;
    verdict: string | null;
    verdictType: "SERVER_TIMEOUT" | "CLIENT_FREEZE" | "HYDRATION_ERROR" | null;
    transitionStartTime: number | null;
}

// Global event bus
declare global {
    interface Window {
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_CHECKPOINT?: (label: string) => void;
        __originalFetch?: typeof fetch;
        __DIAG_AUTH_CHANGE?: (state: string) => void;
    }
}

export function DiagnosticOverlay() {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [state, setState] = useState<DiagnosticState>({
        authState: "LOADING",
        authChanges: 0,
        routerStatus: "IDLE",
        pathname: "",
        renderCount: 0,
        pendingRequests: [],
        jsErrors: [],
        heartbeatAlive: true,
        lastHeartbeat: Date.now(),
        verdict: null,
        verdictType: null,
        transitionStartTime: null,
    });

    const startTimeRef = useRef<number | null>(null);
    const heartbeatRef = useRef<number>(Date.now());
    const frameRef = useRef<number>(0);
    const prevAuthLoading = useRef<boolean>(loading);

    // =========================================================================
    // AUTH STATE TRACKING
    // =========================================================================
    useEffect(() => {
        let authState: DiagnosticState["authState"] = "NULL";
        if (loading) authState = "LOADING";
        else if (user) authState = "AUTHENTICATED";

        // Track auth state changes
        const authChanged = prevAuthLoading.current !== loading;
        prevAuthLoading.current = loading;

        setState(prev => ({
            ...prev,
            authState,
            authChanges: authChanged ? prev.authChanges + 1 : prev.authChanges,
            pathname,
            renderCount: prev.renderCount + 1,
        }));

        // If auth goes to LOADING during navigation, flag it
        if (loading && state.routerStatus === "NAVIGATING") {
            window.__DIAG_CHECKPOINT?.("AUTH_BLOCKED");
        }
    }, [user, loading, pathname, state.routerStatus]);

    // =========================================================================
    // FETCH INTERCEPTOR - RSC STREAM MONITOR
    // =========================================================================
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!window.__originalFetch) {
            window.__originalFetch = window.fetch;

            window.fetch = async (...args) => {
                const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
                const isRsc = url.includes("_rsc") || url.includes("__nextjs") || url.includes("_next/data");

                if (isRsc) {
                    const shortUrl = url.split("?")[0].slice(-40);
                    const now = Date.now();

                    // Add to pending requests
                    setState(prev => ({
                        ...prev,
                        pendingRequests: [...prev.pendingRequests, { url: shortUrl, startTime: now, resolved: false }].slice(-5),
                    }));

                    try {
                        const response = await window.__originalFetch!(...args);
                        const elapsed = Date.now() - now;

                        // Mark as resolved
                        setState(prev => ({
                            ...prev,
                            pendingRequests: prev.pendingRequests.map(r =>
                                r.url === shortUrl && r.startTime === now ? { ...r, resolved: true } : r
                            ),
                        }));

                        console.log(`[RSC] ${shortUrl} - ${elapsed}ms`);
                        return response;
                    } catch (err) {
                        // Mark as error
                        setState(prev => ({
                            ...prev,
                            pendingRequests: prev.pendingRequests.map(r =>
                                r.url === shortUrl && r.startTime === now ? { ...r, resolved: true } : r
                            ),
                            jsErrors: [...prev.jsErrors, { message: `Fetch failed: ${shortUrl}`, timestamp: new Date().toISOString().slice(11, 19) }].slice(-3),
                        }));
                        throw err;
                    }
                }

                return window.__originalFetch!(...args);
            };
        }
    }, []);

    // =========================================================================
    // MAIN THREAD HEARTBEAT (60fps check)
    // =========================================================================
    useEffect(() => {
        let animationFrameId: number;

        const heartbeat = () => {
            const now = Date.now();
            const delta = now - heartbeatRef.current;
            heartbeatRef.current = now;

            // If more than 100ms since last frame, thread was frozen
            const frozen = delta > 100;

            setState(prev => ({
                ...prev,
                heartbeatAlive: !frozen,
                lastHeartbeat: now,
                // If frozen during navigation, update verdict
                ...(frozen && prev.routerStatus === "NAVIGATING" ? {
                    verdict: "🔴 CLIENT_FREEZE: Main thread blocked for " + delta + "ms",
                    verdictType: "CLIENT_FREEZE" as const,
                } : {}),
            }));

            frameRef.current++;
            animationFrameId = requestAnimationFrame(heartbeat);
        };

        animationFrameId = requestAnimationFrame(heartbeat);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // =========================================================================
    // SILENT ERROR CATCHER
    // =========================================================================
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            setState(prev => ({
                ...prev,
                jsErrors: [...prev.jsErrors, { message: event.message.slice(0, 60), timestamp: new Date().toISOString().slice(11, 19) }].slice(-3),
                // If error during navigation, it's hydration error
                ...(prev.routerStatus === "NAVIGATING" ? {
                    verdict: "🟣 HYDRATION_ERROR: " + event.message.slice(0, 40),
                    verdictType: "HYDRATION_ERROR" as const,
                } : {}),
            }));
        };

        const handleRejection = (event: PromiseRejectionEvent) => {
            const msg = event.reason?.message || String(event.reason).slice(0, 60);
            setState(prev => ({
                ...prev,
                jsErrors: [...prev.jsErrors, { message: msg, timestamp: new Date().toISOString().slice(11, 19) }].slice(-3),
                ...(prev.routerStatus === "NAVIGATING" ? {
                    verdict: "🟣 HYDRATION_ERROR: " + msg.slice(0, 40),
                    verdictType: "HYDRATION_ERROR" as const,
                } : {}),
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
            verdictType: null,
            pendingRequests: [],
            jsErrors: [],
        }));

        // Set timeout for SERVER_TIMEOUT detection
        setTimeout(() => {
            setState(prev => {
                // Check for pending unresolved requests
                const hasTimeout = prev.pendingRequests.some(r => !r.resolved && (Date.now() - r.startTime) > 3000);
                if (hasTimeout && !prev.verdictType) {
                    return {
                        ...prev,
                        verdict: "🟠 SERVER_TIMEOUT: RSC request pending >3s",
                        verdictType: "SERVER_TIMEOUT",
                    };
                }
                return prev;
            });
        }, 3000);
    }, []);

    useEffect(() => {
        window.__DIAG_NAV_START = handleNavStart;
        return () => { delete window.__DIAG_NAV_START; };
    }, [handleNavStart]);

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
    // RENDER
    // =========================================================================
    const elapsed = state.transitionStartTime && state.routerStatus === "NAVIGATING"
        ? Date.now() - state.transitionStartTime
        : null;

    const hasUnresolvedRequest = state.pendingRequests.some(r => !r.resolved && (Date.now() - r.startTime) > 2000);

    return (
        <div className={`fixed bottom-4 right-4 z-[9999] border rounded-lg p-3 font-mono text-[10px] space-y-1 shadow-2xl min-w-[340px] max-h-[500px] overflow-y-auto ${state.verdictType ? "bg-red-950/95 border-red-500/50" : "bg-black/95 border-white/20"}`}>
            {/* Header with Heartbeat */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-2">
                <span className="text-white/50 font-bold">🔬 MRI MODE v5</span>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state.heartbeatAlive ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-white/30">{frameRef.current % 100}</span>
                    {state.routerStatus === "NAVIGATING" && (
                        <span className="text-yellow-400 animate-pulse">● {elapsed}ms</span>
                    )}
                </div>
            </div>

            {/* Core Status */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                <span className="text-white/40">AUTH:</span>
                <span className={state.authState === "LOADING" ? "text-yellow-400" : state.authState === "AUTHENTICATED" ? "text-green-400" : "text-red-400"}>
                    {state.authState} ({state.authChanges} changes)
                </span>

                <span className="text-white/40">ROUTER:</span>
                <span className={state.routerStatus === "NAVIGATING" ? "text-yellow-400" : "text-green-400"}>
                    {state.routerStatus}
                </span>

                <span className="text-white/40">PATH:</span>
                <span className="text-blue-400 truncate">{state.pathname}</span>
            </div>

            {/* Verdict */}
            {state.verdict && (
                <div className={`border-t border-red-500/30 pt-2 mt-2 ${state.verdictType === "SERVER_TIMEOUT" ? "animate-pulse" : ""}`}>
                    <div className="text-red-400 font-bold text-xs">{state.verdict}</div>
                </div>
            )}

            {/* Pending Requests */}
            {state.pendingRequests.length > 0 && (
                <div className="border-t border-white/10 pt-1 mt-1">
                    <div className="text-white/40 mb-1">RSC REQUESTS:</div>
                    <div className="space-y-0.5 pl-2">
                        {state.pendingRequests.map((req, i) => {
                            const age = Date.now() - req.startTime;
                            const isStale = !req.resolved && age > 2000;
                            return (
                                <div key={i} className={`flex items-center gap-2 ${isStale ? "text-red-400 animate-pulse" : ""}`}>
                                    <span className={req.resolved ? "text-green-400" : isStale ? "text-red-400" : "text-yellow-400"}>
                                        {req.resolved ? "✓" : isStale ? "⚠" : "↻"}
                                    </span>
                                    <span className="truncate max-w-[200px]">{req.url}</span>
                                    {!req.resolved && <span className="text-white/30">{age}ms</span>}
                                </div>
                            );
                        })}
                    </div>
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
                <span>v5-mri</span>
            </div>
        </div>
    );
}

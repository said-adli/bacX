"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * SHADOW HIJACKER v12 - THE COMMAND CENTER
 * - Intercepts all sidebar clicks
 * - Shadow fetch with RSC header
 * - Raw server response display
 * - Long task detector
 */

interface ShadowFetchResult {
    url: string;
    status: "PENDING" | "SUCCESS" | "ERROR" | "TIMEOUT";
    statusCode: number | null;
    responseSize: number | null;
    responseTime: number | null;
    responsePreview: string;
    error: string | null;
}

interface LongTask {
    name: string;
    duration: number;
    timestamp: number;
}

interface HijackerState {
    isOpen: boolean;
    targetUrl: string | null;
    shadowFetch: ShadowFetchResult | null;
    verdict: string | null;
    longTasks: LongTask[];
    rawStream: string;
    uiFrozen: boolean;
}

// Global hijacker
declare global {
    interface Window {
        __HIJACK_NAV?: (url: string) => void;
        __DIAG_NAV_START?: (target: string) => void;
        __DIAG_CHECKPOINT?: (phase: string, source?: string) => void;
        __DIAG_FETCH_TIME?: (ms: number) => void;
        __DIAG_PROFILE?: (name: string, time: number, phase: string) => void;
        __originalFetch?: typeof fetch;
    }
}

export function ShadowHijacker() {
    const pathname = usePathname();
    const [state, setState] = useState<HijackerState>({
        isOpen: false,
        targetUrl: null,
        shadowFetch: null,
        verdict: null,
        longTasks: [],
        rawStream: "",
        uiFrozen: false,
    });

    const fetchAbortRef = useRef<AbortController | null>(null);
    const lastHeartbeat = useRef<number>(Date.now());
    const frameCount = useRef<number>(0);

    // =========================================================================
    // LONG TASK DETECTOR
    // =========================================================================
    useEffect(() => {
        if (typeof window === "undefined" || !window.PerformanceObserver) return;

        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        setState(prev => ({
                            ...prev,
                            longTasks: [...prev.longTasks, {
                                name: entry.name || "anonymous",
                                duration: entry.duration,
                                timestamp: Date.now(),
                            }].slice(-5),
                        }));
                    }
                }
            });

            observer.observe({ entryTypes: ["longtask"] });
            return () => observer.disconnect();
        } catch (e) {
            // Long task API not supported
        }
    }, []);

    // =========================================================================
    // MAIN THREAD HEARTBEAT
    // =========================================================================
    useEffect(() => {
        let animationFrameId: number;

        const heartbeat = () => {
            const now = Date.now();
            const delta = now - lastHeartbeat.current;
            lastHeartbeat.current = now;
            frameCount.current++;

            // If more than 200ms since last frame, UI is frozen
            if (delta > 200 && state.isOpen) {
                setState(prev => ({
                    ...prev,
                    uiFrozen: true,
                }));
            }

            animationFrameId = requestAnimationFrame(heartbeat);
        };

        animationFrameId = requestAnimationFrame(heartbeat);
        return () => cancelAnimationFrame(animationFrameId);
    }, [state.isOpen]);

    // =========================================================================
    // SHADOW FETCH - THE HIJACKER
    // =========================================================================
    const executeShadowFetch = async (url: string) => {
        // Abort any previous fetch
        if (fetchAbortRef.current) {
            fetchAbortRef.current.abort();
        }

        fetchAbortRef.current = new AbortController();
        const startTime = Date.now();

        setState(prev => ({
            ...prev,
            isOpen: true,
            targetUrl: url,
            shadowFetch: {
                url,
                status: "PENDING",
                statusCode: null,
                responseSize: null,
                responseTime: null,
                responsePreview: "",
                error: null,
            },
            verdict: null,
            rawStream: "",
            uiFrozen: false,
            longTasks: [],
        }));

        try {
            // Shadow fetch with RSC header
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "RSC": "1",
                    "Next-Router-State-Tree": "[]",
                    "Next-Router-Prefetch": "1",
                },
                signal: fetchAbortRef.current.signal,
            });

            const responseTime = Date.now() - startTime;
            const text = await response.text();

            setState(prev => ({
                ...prev,
                shadowFetch: {
                    url,
                    status: response.ok ? "SUCCESS" : "ERROR",
                    statusCode: response.status,
                    responseSize: text.length,
                    responseTime,
                    responsePreview: text.slice(0, 2000),
                    error: response.ok ? null : `HTTP ${response.status}`,
                },
                rawStream: text.slice(0, 5000),
                verdict: response.ok
                    ? "🟢 SERVER ALIVE - Data received. If UI is frozen, it's HYDRATION DEADLOCK."
                    : `🔴 SERVER ERROR - ${response.status}`,
            }));

        } catch (err) {
            const responseTime = Date.now() - startTime;
            const errorMsg = err instanceof Error ? err.message : "Unknown error";

            if (errorMsg.includes("aborted")) {
                return; // User cancelled
            }

            setState(prev => ({
                ...prev,
                shadowFetch: {
                    url,
                    status: responseTime > 10000 ? "TIMEOUT" : "ERROR",
                    statusCode: null,
                    responseSize: null,
                    responseTime,
                    responsePreview: "",
                    error: errorMsg,
                },
                verdict: responseTime > 10000
                    ? "🔴 SERVER PARALYSIS - No response after 10 seconds"
                    : `🔴 FETCH FAILED - ${errorMsg}`,
            }));
        }
    };

    // =========================================================================
    // GLOBAL HIJACKER REGISTRATION
    // =========================================================================
    useEffect(() => {
        window.__HIJACK_NAV = (url: string) => {
            executeShadowFetch(url);
        };
        return () => {
            delete window.__HIJACK_NAV;
        };
    }, []);

    // =========================================================================
    // CLOSE PANEL
    // =========================================================================
    const closePanel = () => {
        if (fetchAbortRef.current) {
            fetchAbortRef.current.abort();
        }
        setState(prev => ({ ...prev, isOpen: false }));
    };

    // =========================================================================
    // FORCE HARD NAVIGATE
    // =========================================================================
    const forceHardNavigate = () => {
        if (state.targetUrl) {
            window.location.href = state.targetUrl;
        }
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    if (!state.isOpen) {
        return null;
    }

    const sf = state.shadowFetch;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl overflow-auto p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white font-mono">
                    👁️ SHADOW HIJACKER v12 - COMMAND CENTER
                </h1>
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${state.uiFrozen ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                    <span className="text-white/50 font-mono text-sm">Frame: {frameCount.current}</span>
                    <button
                        onClick={closePanel}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                    >
                        ✕ Close
                    </button>
                </div>
            </div>

            {/* Target URL */}
            <div className="mb-4 p-4 bg-white/5 rounded-lg">
                <span className="text-white/40 text-sm">TARGET:</span>
                <div className="text-blue-400 font-mono text-lg">{state.targetUrl}</div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Server Status */}
                <div className="p-4 bg-white/5 rounded-lg">
                    <h2 className="text-white/60 text-sm mb-3 uppercase tracking-wider">RAW SERVER STATUS</h2>
                    <div className={`text-3xl font-bold mb-2 ${sf?.status === "PENDING" ? "text-yellow-400 animate-pulse" :
                        sf?.status === "SUCCESS" ? "text-green-400" :
                            "text-red-400"
                        }`}>
                        {sf?.status || "—"}
                    </div>
                    {sf?.statusCode && (
                        <div className="text-white/60">HTTP {sf.statusCode}</div>
                    )}
                    {sf?.responseTime && (
                        <div className="text-white/40">{sf.responseTime}ms</div>
                    )}
                    {sf?.responseSize && (
                        <div className="text-white/40">{(sf.responseSize / 1024).toFixed(1)} KB</div>
                    )}
                    {sf?.error && (
                        <div className="text-red-400 text-sm mt-2">{sf.error}</div>
                    )}
                </div>

                {/* Verdict */}
                <div className="p-4 bg-white/5 rounded-lg">
                    <h2 className="text-white/60 text-sm mb-3 uppercase tracking-wider">THE VERDICT</h2>
                    <div className={`text-lg font-bold ${state.verdict?.includes("🟢") ? "text-green-400" : "text-red-400"
                        }`}>
                        {state.verdict || "Waiting for response..."}
                    </div>
                    {state.uiFrozen && (
                        <div className="mt-2 text-orange-400 animate-pulse">
                            ⚠️ UI THREAD FROZEN
                        </div>
                    )}
                </div>
            </div>

            {/* Emergency Bypass */}
            <div className="mb-4">
                <button
                    onClick={forceHardNavigate}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-lg"
                >
                    🚀 JUMP TO PAGE (HARD) → {state.targetUrl}
                </button>
            </div>

            {/* Long Tasks */}
            {state.longTasks.length > 0 && (
                <div className="mb-4 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                    <h2 className="text-orange-400 text-sm mb-2 uppercase tracking-wider">⚠️ LONG TASKS DETECTED ({'>'}50ms)</h2>
                    <div className="space-y-1 font-mono text-sm">
                        {state.longTasks.map((task, i) => (
                            <div key={i} className="flex justify-between text-orange-300">
                                <span>{task.name}</span>
                                <span className="text-orange-400">{task.duration.toFixed(0)}ms</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* RSC Raw Stream */}
            <div className="p-4 bg-white/5 rounded-lg">
                <h2 className="text-white/60 text-sm mb-3 uppercase tracking-wider">RSC STREAM (RAW DATA)</h2>
                <pre className="text-green-400/80 font-mono text-[10px] whitespace-pre-wrap break-all max-h-64 overflow-y-auto bg-black/50 p-3 rounded">
                    {state.rawStream || (sf?.status === "PENDING" ? "Waiting for data..." : "No data received")}
                </pre>
            </div>
        </div>
    );
}

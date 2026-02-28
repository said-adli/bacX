"use client";

import { useSyncExternalStore } from "react";

// Snapshot function: computes the current "low end" status
function getSnapshot() {
    if (typeof window === 'undefined') return false;

    // 1. Check for reduced motion/transparency preferences (OS Level)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Note: prefers-reduced-transparency is not standard in all browsers yet, but we can check it
    const prefersReducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;

    if (prefersReducedMotion || prefersReducedTransparency) {
        return true;
    }

    // 2. Hardware Heuristics
    // Define interface locally for type safety within strict mode
    interface NavigatorWithMemory extends Navigator {
        deviceMemory?: number;
    }

    const nav = navigator as NavigatorWithMemory;
    const hardwareConcurrency = nav.hardwareConcurrency || 4;
    const deviceMemory = nav.deviceMemory || 4;

    // Thresholds: Less than 4 cores OR less than 4GB RAM 
    if (hardwareConcurrency < 4 || deviceMemory < 4) {
        return true;
    }

    return false;
}

// Subscribe function: Listens for changes (only media queries change at runtime)
function subscribe(callback: () => void) {
    if (typeof window === 'undefined') return () => { };

    const mediaQueryMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mediaQueryTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");

    mediaQueryMotion.addEventListener("change", callback);
    mediaQueryTransparency.addEventListener("change", callback);

    return () => {
        mediaQueryMotion.removeEventListener("change", callback);
        mediaQueryTransparency.removeEventListener("change", callback);
    };
}

// Server snapshot: Always false during SSR to avoid hydration mismatch
function getServerSnapshot() {
    return false;
}

export function useIsLowEndDevice() {
    // 3rd argument is strictly for SSR
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

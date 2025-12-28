"use client";

import { useEffect, useState } from "react";

export function useIsLowEndDevice() {
    const [isLowEnd, setIsLowEnd] = useState(false);

    useEffect(() => {
        // 1. Check for reduced motion/transparency preferences (OS Level)
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // Note: prefers-reduced-transparency is not standard in all browsers yet, but we can check it
        const prefersReducedTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;

        if (prefersReducedMotion || prefersReducedTransparency) {
            // Defer update to avoid warning if strict mode checks this
            // Actually, setting state in effect IS correct for client-side checks after mount.
            // The warning "Calling setState synchronously within an effect" usually refers to when it causes loops,
            // or if it should have been initial state. Here it depends on window.matchMedia.
            setIsLowEnd(true);
            return;
        }

        // 2. Hardware Heuristics
        // Navigator properties might not exist in all browsers
        const hardwareConcurrency = navigator.hardwareConcurrency || 4; // Default to 4 if unknown
        const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB if unknown

        // Thresholds: Less than 4 cores OR less than 4GB RAM is considered "Low End" for heavy blur
        if (hardwareConcurrency < 4 || deviceMemory < 4) {
            setIsLowEnd(true);
        }

        // 3. User Agent sniffing (Optional/Fallback)
        // Detect older Androids that report high cores but have weak GPUs? 
        // For now, reliance on Concurrency/Memory is standard.

    }, []);

    return isLowEnd;
}

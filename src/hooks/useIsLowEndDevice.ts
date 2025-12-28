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
            setIsLowEnd(true);
            return;
        }

        // 2. Hardware Heuristics
        interface NavigatorWithMemory extends Navigator {
            deviceMemory?: number;
        }

        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        const deviceMemory = (navigator as NavigatorWithMemory).deviceMemory || 4;

        // Thresholds: Less than 4 cores OR less than 4GB RAM 
        if (hardwareConcurrency < 4 || deviceMemory < 4) {
            setIsLowEnd(true);
        }
    }, []);

    return isLowEnd;
}

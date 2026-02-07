
"use client";

import { memo, useEffect, useRef, useState } from "react";
import { User } from "@supabase/supabase-js";
import { hashUID } from "@/lib/hash";

interface DynamicWatermarkProps {
    user: User | null;
}

export const DynamicWatermark = memo(({ user }: DynamicWatermarkProps) => {
    const [watermarkStr, setWatermarkStr] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.id) {
            hashUID(user.id).then(hash => {
                const id = user.email ? user.email.split('@')[0] : hash;
                setWatermarkStr(`${id} • ${hash} • BRAINY PROTECTED`);
            });
        }
    }, [user]);

    const triggerSecurityBreach = () => {
        // Stop video playback / Blur screen / Alert
        console.error("SECURITY BREACH DETECTED: WATERMARK TAMPERING");
        alert("Security Alert: Watermark tampering detected. Session validation required.");
        // In a real app: window.location.href = '/logout';
    };

    // Anti-Tamper Mechanism
    useEffect(() => {
        if (!containerRef.current) return;

        const targetNode = containerRef.current;
        const config = { attributes: true, childList: true, subtree: true };

        const callback = (mutationsList: MutationRecord[]) => {
            for (const mutation of mutationsList) {
                // If opacity is tampered with or node removed
                if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    const opacity = window.getComputedStyle(targetNode).opacity;
                    if (parseFloat(opacity) < 0.1 || window.getComputedStyle(targetNode).display === 'none') {
                        triggerSecurityBreach();
                    }
                }
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    // Check if SVG was removed
                    triggerSecurityBreach();
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);

        // Also check periodically
        const interval = setInterval(() => {
            if (!document.body.contains(targetNode)) {
                triggerSecurityBreach();
            }
        }, 2000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    if (!user) return null;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none z-[100] overflow-hidden select-none"
            style={{ opacity: 0.15 }} // Inline style for easier detection
        >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="watermark-pattern" width="350" height="350" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                        <text x="50%" y="50%" textAnchor="middle" fill="white" fontSize="16" fontFamily="monospace" fontWeight="900" letterSpacing="2px">
                            {watermarkStr}
                        </text>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#watermark-pattern)" />
            </svg>
        </div>
    );
});

DynamicWatermark.displayName = "DynamicWatermark";

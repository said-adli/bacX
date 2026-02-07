"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface SkeletonProps extends HTMLMotionProps<"div"> {
    className?: string;
    width?: string | number;
    height?: string | number;
}

export function Skeleton({ className, width, height, ...props }: SkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0.5, scale: 0.99 }}
            animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.99, 1, 0.99]
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={cn(
                "relative overflow-hidden rounded-md bg-white/5 backdrop-blur-sm",
                className
            )}
            style={{ width, height }}
            {...props}
        >
            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{ translateX: ["-100%", "100%"] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)",
                }}
            />
        </motion.div>
    );
}

"use client";

import { motion } from "framer-motion";

export function NeuralBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Floating Neural Nodes - Left Side */}
            <motion.div
                className="absolute top-1/4 left-10 w-2 h-2 bg-blue-500 rounded-full blur-[1px] shadow-[0_0_10px_#2563EB]"
                animate={{
                    y: [-20, 20, -20],
                    opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-1/3 left-20 w-3 h-3 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_15px_#60A5FA]"
                animate={{
                    y: [15, -15, 15],
                    opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            {/* Faint Lines connecting nodes (Static representation implies connection) */}
            <svg className="absolute top-0 left-0 w-64 h-full pointer-events-none opacity-20">
                <motion.path
                    d="M50 200 Q 100 250 150 200 T 250 250"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1"
                    animate={{
                        d: [
                            "M50 200 Q 100 250 150 200 T 250 250",
                            "M50 210 Q 90 260 150 210 T 250 260",
                            "M50 200 Q 100 250 150 200 T 250 250"
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </svg>

            {/* Floating Neural Nodes - Right Side */}
            <motion.div
                className="absolute bottom-1/3 right-10 w-2 h-2 bg-blue-500 rounded-full blur-[1px] shadow-[0_0_10px_#2563EB]"
                animate={{
                    y: [20, -20, 20],
                    opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-24 w-3 h-3 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_15px_#60A5FA]"
                animate={{
                    y: [-15, 15, -15],
                    opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
            />

            {/* Abstract Energy Waves - Pulsing Background */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/10"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.05, 0.1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-400/10"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.05, 0.1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />
        </div>
    );
}

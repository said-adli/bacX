"use client";

import { useLiveStatus } from "@/hooks/useLiveStatus";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function LiveBadge({ className }: { className?: string }) {
    const { isLive, loading } = useLiveStatus();

    if (loading || !isLive) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
            >
                <Link href="/live" className={cn("group flex items-center gap-2.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-all cursor-pointer backdrop-blur-md", className)}>
                    <div className="relative flex h-2.5 w-2.5">
                        <motion.span
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inline-flex h-full w-full rounded-full bg-red-500"
                        />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                    </div>
                    <span className="text-[11px] font-bold text-red-500 font-tajawal group-hover:text-red-400 tracking-wide">مباشر الآن</span>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}

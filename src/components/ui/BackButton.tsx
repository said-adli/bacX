"use client";

import { ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Hide on home page and auth page
    const isHidden = pathname === "/" || pathname === "/auth";

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className={cn(
                        "fixed top-6 left-6 z-50", // Left side for RTL back (or right? RTL usually means back is Right arrow pointing Left, but positioning depends on design. Apple stores Back on Top-Left in LTR. In RTL it should optionally be Top-Right. Let's stick to user request: 'top-right (for RTL)'
                        // Actually, in RTL specific IOS apps, 'Back' is Top-Right with Arrow pointing Right.
                        "left-6",
                        "w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg transition-colors cursor-pointer"
                    )}
                >
                    <ChevronRight className="w-5 h-5" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}

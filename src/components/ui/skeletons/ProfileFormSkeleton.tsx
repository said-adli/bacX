"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronRight } from "lucide-react";

export default function ProfileFormSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse pb-20 pt-8">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-2 rounded-xl bg-white/5 w-10 h-10" />
                <div>
                    <div className="h-8 w-48 bg-white/5 rounded-lg mb-2" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg" />
                </div>
            </div>

            <GlassCard className="p-8 space-y-8 border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-20 bg-white/5 rounded-md" />
                            <div className="h-11 w-full bg-white/5 rounded-xl" />
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* SAVE BUTTON Skeleton */}
            <div className="sticky bottom-6 flex justify-end bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
                <div className="h-11 w-40 bg-white/10 rounded-xl" />
            </div>
        </div>
    );
}

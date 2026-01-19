"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export default function GlassSkeleton() {
    return (
        <div className="space-y-8 p-4 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
            </div>

            {/* Grid Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <GlassCard key={i} className="h-64 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                        <div className="h-full flex flex-col justify-between p-2">
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 bg-white/10 rounded-md" />
                                <div className="h-4 w-full bg-white/5 rounded-md" />
                                <div className="h-4 w-2/3 bg-white/5 rounded-md" />
                            </div>
                            <div className="h-10 w-full bg-white/10 rounded-xl" />
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}

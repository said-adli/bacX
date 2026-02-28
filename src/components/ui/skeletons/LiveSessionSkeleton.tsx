"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export default function LiveSessionSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-white/5 rounded-lg mb-2" />
                    <div className="h-4 w-24 bg-white/5 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Player Area */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Video Player Placeholder */}
                    <div className="w-full aspect-video rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
                        <div className="absolute center w-16 h-16 rounded-full bg-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* Info Card */}
                    <GlassCard className="p-6 h-24 flex items-center gap-4">
                        <div className="h-8 w-1/3 bg-white/5 rounded-lg" />
                        <div className="h-8 w-24 bg-white/5 rounded-full ml-auto" />
                    </GlassCard>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-1 h-[600px] flex flex-col">
                    <GlassCard className="h-full p-4 flex flex-col gap-4">
                        <div className="h-10 w-full bg-white/5 rounded-lg" />
                        <div className="flex-1 space-y-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="h-3 w-20 bg-white/5 rounded" />
                                        <div className="h-8 w-full bg-white/5 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="h-12 w-full bg-white/5 rounded-xl mt-auto" />
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

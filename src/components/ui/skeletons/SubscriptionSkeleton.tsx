"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export function PlansGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-6 h-[400px] flex flex-col relative overflow-hidden border-white/5">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-white/5 mb-4" />

                    {/* Title */}
                    <div className="h-8 w-3/4 bg-white/5 rounded-md mb-2" />

                    {/* Price */}
                    <div className="h-10 w-1/2 bg-white/5 rounded-md mb-4" />

                    {/* Description */}
                    <div className="space-y-2 mb-6 flex-1">
                        <div className="h-3 w-full bg-white/5 rounded-md" />
                        <div className="h-3 w-5/6 bg-white/5 rounded-md" />
                        <div className="h-3 w-4/6 bg-white/5 rounded-md" />
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-white/5" />
                                <div className="h-3 w-1/2 bg-white/5 rounded-md" />
                            </div>
                        ))}
                    </div>

                    {/* Button */}
                    <div className="w-full h-12 rounded-xl bg-white/5 mt-auto" />
                </GlassCard>
            ))}
        </div>
    );
}

export function BillingHistorySkeleton() {
    return (
        <div className="w-full animate-pulse">
            {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-white/5">
                    <td className="p-4"><div className="h-4 w-12 bg-white/5 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-white/5 rounded-md" /></td>
                    <td className="p-4"><div className="h-8 w-8 bg-white/5 rounded-lg" /></td>
                </tr>
            ))}
        </div>
    );
}

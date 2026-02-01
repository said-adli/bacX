import { Skeleton } from "@/components/ui/Skeleton";
import { GlassCard } from "@/components/ui/GlassCard";

export function SettingsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 pt-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-12 h-12 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-white/10" />
                    <Skeleton className="h-4 w-32 bg-white/5" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 border border-white/5 rounded-2xl bg-white/5 space-y-4">
                            <Skeleton className="h-6 w-1/3 bg-white/10" />
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full bg-white/5" />
                                <Skeleton className="h-12 w-full bg-white/5" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
                    <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
                </div>
            </div>
        </div>
    );
}

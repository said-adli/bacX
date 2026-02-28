import { Skeleton } from "@/components/ui/Skeleton";

export function LessonSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-pulse">
            {/* Left: Video Area (Taking up 8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Video Player Skeleton (16:9) */}
                <div className="relative w-full aspect-video bg-white/5 rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50" />
                </div>

                {/* Lesson Details Skeleton */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-start justify-between">
                    <div className="space-y-4 w-1/2">
                        <Skeleton className="h-8 w-3/4 bg-white/10" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-24 bg-white/5" />
                            <Skeleton className="h-4 w-24 bg-white/5" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
                        <Skeleton className="h-10 w-32 rounded-lg bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Right: Sidebar Skeleton (4 cols) */}
            <div className="lg:col-span-4 h-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                <Skeleton className="h-8 w-1/2 bg-white/10 mb-6" />

                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                        <Skeleton className="h-12 w-full rounded-xl bg-white/5 opacity-60" />
                        <Skeleton className="h-12 w-full rounded-xl bg-white/5 opacity-30" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PlayerSkeleton() {
    return (
        <div className="relative w-full aspect-video bg-white/5 rounded-2xl border border-white/5 overflow-hidden animate-pulse shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/10" />
            </div>
        </div>
    );
}

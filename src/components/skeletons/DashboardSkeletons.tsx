import { Skeleton } from "@/components/ui/Skeleton";

export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-6 flex items-center justify-between border border-white/5 bg-white/5">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-white/10" />
                        <Skeleton className="h-8 w-16 bg-white/10" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                </div>
            ))}
        </div>
    );
}

export function ContinueWatchingSkeleton() {
    return (
        <div className="mb-8 px-4 md:px-0">
            <Skeleton className="h-7 w-48 bg-white/10 mb-4" /> {/* Title */}
            <div className="w-full h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse flex items-center p-6">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
                    <Skeleton className="h-6 w-64 bg-white/10" />
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-20 bg-white/10" />
                        <Skeleton className="h-4 w-32 bg-white/10" />
                    </div>
                </div>
                <Skeleton className="w-16 h-16 rounded-full bg-white/10" />
            </div>
        </div>
    );
}

export function SubjectsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[200px] rounded-2xl bg-white/5 border border-white/5 animate-pulse p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32 bg-white/10" />
                            <Skeleton className="h-4 w-48 bg-white/10" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-2 w-full bg-white/10 rounded-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-12 bg-white/10" />
                            <Skeleton className="h-3 w-12 bg-white/10" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

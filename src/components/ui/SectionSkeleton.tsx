import { cn } from "@/lib/utils";

interface SectionSkeletonProps {
    className?: string;
}

export function SectionSkeleton({ className }: SectionSkeletonProps) {
    return (
        <div className={cn("w-full py-24 px-6", className)}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
                    <div className="h-1 w-24 bg-white/10 rounded-full animate-pulse" />
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

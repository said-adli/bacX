import { Skeleton } from "@/components/ui/Skeleton";

export function TableSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-6">
                <Skeleton className="h-12 flex-1 rounded-xl bg-white/5" />
                <Skeleton className="h-12 w-32 rounded-xl bg-white/5" />
            </div>

            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/20">
                <div className="bg-white/5 p-4 border-b border-white/5 flex gap-4">
                    <Skeleton className="h-6 w-6 rounded bg-white/10" />
                    <Skeleton className="h-6 w-32 bg-white/10" />
                    <div className="flex-1" />
                    <Skeleton className="h-6 w-24 bg-white/10" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b border-white/5 flex items-center gap-4">
                        <Skeleton className="h-6 w-6 rounded bg-white/10" />
                        <div className="flex items-center gap-3 w-64">
                            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32 bg-white/10" />
                                <Skeleton className="h-3 w-24 bg-white/5" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-24 bg-white/5 ml-auto hidden md:block" />
                        <Skeleton className="h-4 w-24 bg-white/5 hidden lg:block" />
                        <Skeleton className="h-8 w-20 rounded-full bg-white/10 ml-auto" />
                        <Skeleton className="h-8 w-24 rounded-lg bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}

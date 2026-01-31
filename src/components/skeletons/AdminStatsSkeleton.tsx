import { Skeleton } from "@/components/ui/Skeleton";

export function AdminStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-2xl border border-white/5 bg-black/20">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                        <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
                        <Skeleton className="h-8 w-32 bg-white/10" />
                    </div>
                </div>
            ))}
        </div>
    );
}

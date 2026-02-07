import { Skeleton } from "@/components/ui/Skeleton";

export function RecentSignupsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-white/10" />
                            <Skeleton className="h-3 w-48 bg-white/5" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
                </div>
            ))}
        </div>
    );
}

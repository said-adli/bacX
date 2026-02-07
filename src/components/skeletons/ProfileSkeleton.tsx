import { Skeleton } from "@/components/ui/Skeleton";


export function ProfileSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse pb-20 pt-8">
            <Skeleton className="h-10 w-48 bg-white/10" />

            <div className="p-8 border border-white/5 rounded-2xl bg-white/5 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/5">
                    <Skeleton className="w-24 h-24 rounded-full bg-white/10" />

                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-64 bg-white/10" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
                            <Skeleton className="h-6 w-24 rounded-full bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-4 w-32 bg-white/5" />
                            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                        </div>
                    ))}

                    {/* Bio */}
                    <div className="col-span-1 md:col-span-2 space-y-3">
                        <Skeleton className="h-4 w-32 bg-white/5" />
                        <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

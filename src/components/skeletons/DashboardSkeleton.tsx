
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 w-full animate-pulse p-1">
            {/* Welcome Banner Skeleton */}
            <div className="h-32 w-full bg-slate-800/30 rounded-3xl" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-24 bg-slate-800/30 rounded-2xl" />
                <div className="h-24 bg-slate-800/30 rounded-2xl" />
                <div className="h-24 bg-slate-800/30 rounded-2xl" />
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-slate-800/30 rounded-3xl" />
                    <div className="h-40 bg-slate-800/30 rounded-3xl" />
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    <div className="h-96 bg-slate-800/30 rounded-3xl" />
                </div>
            </div>
        </div>
    );
}

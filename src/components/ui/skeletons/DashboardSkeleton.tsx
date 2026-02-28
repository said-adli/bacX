export function DashboardSkeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-28 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/5"
                        style={{ animationDelay: `${i * 100}ms` }}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Large Card */}
                <div className="md:col-span-2 h-[400px] bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/5" />

                {/* Side Cards */}
                <div className="space-y-4">
                    <div className="h-48 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/5" />
                    <div className="h-48 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/5" />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/5" />
                <div className="h-32 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-white/5" />
            </div>
        </div>
    );
}

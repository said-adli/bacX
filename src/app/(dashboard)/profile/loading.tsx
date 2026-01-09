export default function ProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-16 bg-white/10 rounded" />
                <div className="h-3 w-3 bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/10 rounded" />
            </div>

            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-7 w-36 bg-white/10 rounded mb-2" />
                <div className="h-4 w-52 bg-white/5 rounded" />
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Identity panel skeleton */}
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-xl bg-white/10" />
                            <div>
                                <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                                <div className="h-4 w-48 bg-white/5 rounded" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-white/10 rounded" />
                            <div className="h-6 w-16 bg-white/10 rounded" />
                        </div>
                    </div>

                    {/* Academic info skeleton */}
                    <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                </div>

                {/* Side column skeleton */}
                <div className="space-y-6">
                    <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                    <div className="h-32 bg-primary/10 rounded-2xl border border-primary/20" />
                </div>
            </div>
        </div>
    );
}

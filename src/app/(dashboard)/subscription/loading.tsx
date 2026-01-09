export default function SubscriptionLoading() {
    return (
        <div className="max-w-4xl mx-auto animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-16 bg-white/10 rounded" />
                <div className="h-3 w-3 bg-white/10 rounded" />
                <div className="h-3 w-12 bg-white/10 rounded" />
            </div>

            {/* Header skeleton */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="h-7 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-64 bg-white/5 rounded" />
                </div>
                <div className="h-10 w-32 bg-primary/20 rounded-lg" />
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                    <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                </div>
                <div className="h-80 bg-white/5 rounded-2xl border border-white/10" />
            </div>
        </div>
    );
}

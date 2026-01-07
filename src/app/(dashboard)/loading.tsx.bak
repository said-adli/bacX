export default function Loading() {
    return (
        <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header Skeleton */}
                <header className="h-16 w-full border-b border-white/10 bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-6">
                    <div className="h-8 w-48 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 animate-pulse" />
                        <div className="h-10 w-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 animate-pulse" />
                    </div>
                </header>

                {/* Page Content Skeleton */}
                <main className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Hero / Welcome Card - Glassy */}
                    <div className="relative w-full h-48 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>

                    {/* Stats Row - Glassy */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="relative h-32 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse overflow-hidden"
                            >
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animationDelay: `${i * 200}ms` }} />
                            </div>
                        ))}
                    </div>

                    {/* Large Content Area - Glassy */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                        <div className="relative lg:col-span-2 h-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </div>
                        <div className="relative h-full rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 animate-pulse overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

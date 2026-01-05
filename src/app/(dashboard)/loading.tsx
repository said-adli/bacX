import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header Skeleton */}
                <header className="h-16 w-full border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-6">
                    <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
                        <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
                    </div>
                </header>

                {/* Page Content Skeleton */}
                <main className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Hero / Welcome Card */}
                    <div className="w-full h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5" />

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                        ))}
                    </div>

                    {/* Large Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                        <div className="lg:col-span-2 h-full rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                        <div className="h-full rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                    </div>
                </main>
            </div>
        </div>
    );
}

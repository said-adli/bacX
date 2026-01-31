import { Suspense } from "react";
import CinematicHero from "@/components/dashboard/CinematicHero";
import { Clock } from "lucide-react";

// Async Components (Streaming)
import StatsOverview from "@/components/dashboard/StatsOverview";
import ContinueWatchingSection from "@/components/dashboard/ContinueWatchingSection";
import SubjectsGrid from "@/components/dashboard/SubjectsGrid";
import SmartSubscriptionCards from "@/components/dashboard/SmartSubscriptionCards";

// Skeletons (Loading States)
import {
    StatsSkeleton,
    ContinueWatchingSkeleton,
    SubjectsSkeleton
} from "@/components/skeletons/DashboardSkeletons";

export const dynamic = 'force-dynamic';

export default function DashboardPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const query = (typeof searchParams.q === 'string' ? searchParams.q : "")?.toLowerCase();

    return (
        <div className="space-y-16 pb-20">

            {/* 1. HERO SECTION (Static/Client - Loads Instantly) */}
            <div className="animate-in fade-in zoom-in duration-700">
                <CinematicHero />
            </div>

            {/* 2. STATS (Streams in parallel) */}
            <Suspense fallback={<StatsSkeleton />}>
                <StatsOverview />
            </Suspense>

            {/* 3. CONTINUE WATCHING (Streams in parallel) */}
            <Suspense fallback={<ContinueWatchingSkeleton />}>
                <ContinueWatchingSection />
            </Suspense>

            {/* 4. CRYSTAL GRID (Subjects) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-white">
                        مسار التعلم {query && <span className="text-sm text-blue-400 font-normal">(نتائج البحث: {query})</span>}
                    </h2>
                </div>

                <Suspense fallback={<SubjectsSkeleton />}>
                    <SubjectsGrid query={query} />
                </Suspense>
            </div>

            {/* 4. SUBSCRIPTION / OFFERS SECTION */}
            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    <div className="h-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 bg-white/5 rounded-2xl" />
                </div>
            }>
                <SmartSubscriptionCards />
            </Suspense>

            {/* 5. CONTENT SECTIONS */}
            <div className="grid grid-cols-1 gap-8">
                <div className="p-8 border border-white/5 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-center">
                    <Clock className="w-12 h-12 text-blue-400 mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">المستجدات والمواعيد</h3>
                    <p className="text-white/40">سيتم نشر جداول الحصص المباشرة والاختبارات قريباً.</p>
                </div>
            </div>
        </div>
    );
}

import { Suspense } from "react";
import { HeroSlider } from "@/components/marketing/HeroSlider";
import { getActiveHeroSlides } from "@/actions/admin-hero";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { toSafeUserDTO } from "@/lib/dto";

// Async Components (Streaming)
import StatsOverview from "@/components/dashboard/StatsOverview";
import ContinueWatchingSection from "@/components/dashboard/ContinueWatchingSection";
import SubjectsGrid from "@/components/dashboard/SubjectsGrid";
import SmartSubscriptionCards from "@/components/dashboard/SmartSubscriptionCards";
import AnnouncementsSection from "@/components/dashboard/AnnouncementsSection";

// Skeletons (Loading States)
import {
    StatsSkeleton,
    ContinueWatchingSkeleton,
    SubjectsSkeleton,
} from "@/components/skeletons/DashboardSkeletons";

export const dynamic = 'auto';

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // 1. Auth Check - Fast, required for everything
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // MAP TO DTO: Strip ALL auth identities, sensitive emails, phones, and internal Supabase metadata
    // before passing data down to child boundaries.
    const safeUser = toSafeUserDTO(user);
    if (!safeUser) redirect("/login");

    // 2. Parse Query
    const params = await searchParams;
    const query = (typeof params.q === 'string' ? params.q : "")?.toLowerCase();

    // 3. Fetch Data
    const [slides] = await Promise.all([
        getActiveHeroSlides()
    ]);

    // No other top-level blocking data fetching!

    return (
        <div className="space-y-16 pb-20">

            {/* 1. HERO SECTION (Dynamic Ad-Engine) */}
            <div className="animate-in fade-in zoom-in duration-700 mb-12">
                <HeroSlider slides={slides} />
            </div>

            {/* 2. STATS (Streams in parallel) */}
            <Suspense fallback={<StatsSkeleton />}>
                <StatsOverview user={safeUser} />
            </Suspense>

            {/* 3. CONTINUE WATCHING (Streams in parallel) */}
            <Suspense fallback={<ContinueWatchingSkeleton />}>
                <ContinueWatchingSection user={safeUser} />
            </Suspense>

            {/* 4. CRYSTAL GRID (Subjects) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-white">
                        مسار التعلم {query && <span className="text-sm text-blue-400 font-normal">(نتائج البحث: {query})</span>}
                    </h2>
                </div>

                <Suspense fallback={<SubjectsSkeleton />}>
                    <SubjectsGrid query={query} userId={safeUser.id} />
                </Suspense>
            </div>

            {/* 5. UPDATES & SCHEDULE (New 2-Column Grid) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        <div className="h-80 bg-white/5 rounded-2xl" />
                        <div className="h-80 bg-white/5 rounded-2xl" />
                    </div>
                }>
                    <AnnouncementsSection />
                </Suspense>
            </div>

            {/* 6. SUBSCRIPTION / OFFERS SECTION */}
            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    <div className="h-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 bg-white/5 rounded-2xl" />
                </div>
            }>
                <SmartSubscriptionCards user={safeUser} />
            </Suspense>
        </div>
    );
}

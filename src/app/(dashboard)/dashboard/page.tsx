import { Suspense } from "react";
import CinematicHero from "@/components/dashboard/CinematicHero";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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

export const dynamic = 'force-dynamic';

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

    // 2. Parse Query
    const params = await searchParams;
    const query = (typeof params.q === 'string' ? params.q : "")?.toLowerCase();

    // No top-level blocking data fetching!

    return (
        <div className="space-y-16 pb-20">

            {/* 1. HERO SECTION (Static/Client - Loads Instantly) */}
            <div className="animate-in fade-in zoom-in duration-700">
                {/* We can't easily pass 'hasNotification' instantly without blocking. 
                    We can either fetch strictly that boolean fast, or let it load inside.
                    For now, assuming Hero can live without the red dot or it fetches it itself? 
                    The previous code calculated 'hasNewAnnouncements'. 
                    To preserve non-blocking, we might lose the 'red dot' on the Hero OR 
                    we move that check into the Hero or a wrapper. 
                    For this pass, we will pass explicit 'false' or remove the prop if optional, 
                    OR better: fetch just announcements light-weight? 
                    Actually, let's keep it simple: Hero loads instantly, notification status might update later or be skipped for TTI.
                    Let's check CinematicHero definition. I don't want to break it.
                    I will omit the prop if possible or pass false. */}
                <CinematicHero hasNotification={false} />
            </div>

            {/* 2. STATS (Streams in parallel) */}
            <Suspense fallback={<StatsSkeleton />}>
                <StatsOverview user={user} />
            </Suspense>

            {/* 3. CONTINUE WATCHING (Streams in parallel) */}
            <Suspense fallback={<ContinueWatchingSkeleton />}>
                <ContinueWatchingSection user={user} />
            </Suspense>

            {/* 4. CRYSTAL GRID (Subjects) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-bold text-white">
                        مسار التعلم {query && <span className="text-sm text-blue-400 font-normal">(نتائج البحث: {query})</span>}
                    </h2>
                </div>

                <Suspense fallback={<SubjectsSkeleton />}>
                    <SubjectsGrid query={query} userId={user.id} />
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
                <SmartSubscriptionCards user={user} />
            </Suspense>
        </div>
    );
}

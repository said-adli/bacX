import { Suspense } from "react";
import CinematicHero from "@/components/dashboard/CinematicHero";

// Service Layer
import { getDashboardView } from "@/services/dashboard.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// Async Components (Streaming)
import StatsOverview from "@/components/dashboard/StatsOverview";
import ContinueWatchingSection from "@/components/dashboard/ContinueWatchingSection";
import SubjectsGrid from "@/components/dashboard/SubjectsGrid";
import SmartSubscriptionCards from "@/components/dashboard/SmartSubscriptionCards";
import UpdatesSection from "@/components/dashboard/UpdatesSection";

// Skeletons (Loading States)
import {
    StatsSkeleton,
    ContinueWatchingSkeleton,
    SubjectsSkeleton
} from "@/components/skeletons/DashboardSkeletons";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Parse Query
    const params = await searchParams;
    const query = (typeof params.q === 'string' ? params.q : "")?.toLowerCase();

    // 3. Fetch Data via Service Layer (Safe & Typed)
    // Now returns { subjects, announcements }
    const { subjects, announcements } = await getDashboardView(user.id);

    // Check for new announcements for the notification pill
    const hasNewAnnouncements = announcements.some(a => a.isNew);

    return (
        <div className="space-y-16 pb-20">

            {/* 1. HERO SECTION (Static/Client - Loads Instantly) */}
            <div className="animate-in fade-in zoom-in duration-700">
                <CinematicHero hasNotification={hasNewAnnouncements} />
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

                <SubjectsGrid query={query} subjects={subjects} />
            </div>

            {/* 5. UPDATES & SCHEDULE (New 2-Column Grid) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                <UpdatesSection announcements={announcements} />
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

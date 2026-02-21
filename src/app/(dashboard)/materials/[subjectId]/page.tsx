import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Loader2, Video, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

// Async Components (Streaming)
import ActiveVideoPlayer from "@/components/lesson/ActiveVideoPlayer";
import CourseCurriculumSidebar from "@/components/lesson/CourseCurriculumSidebar";
import LessonResourcesTabs from "@/components/lesson/LessonResourcesTabs";

// Skeletons
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export const dynamic = 'force-dynamic';

interface SubjectDetailsPageProps {
    params: Promise<{ subjectId: string }>;
    searchParams: Promise<{ lessonId?: string }>;
}

export default async function SubjectDetailsPage({ params, searchParams }: SubjectDetailsPageProps) {
    const { subjectId } = await params;
    const { lessonId } = await searchParams;

    if (!subjectId || subjectId === "undefined" || typeof subjectId === "object") {
        console.error("CRITICAL: Blocked Supabase call with invalid ID:", subjectId);
        return <div className="p-8 text-white">Invalid subject ID</div>;
    }

    // 1. Fetch Basic Subject Metadata (Fast) & User Check - Parallelized
    const supabase = await createClient();

    const [
        { data: { user } },
        { data: subject }
    ] = await Promise.all([
        supabase.auth.getUser(),
        supabase
            .from('subjects')
            .select('name, id')
            .eq('id', subjectId)
            .eq('is_active', true) // STRICT: Only active subjects
            .single()
    ]);

    // Check subscription status cheaply (Only depends on User)
    const { data: profile } = user ? await supabase.from('profiles').select('is_subscribed, role').eq('id', user.id).single() : { data: null };
    const isSubscribed = profile?.is_subscribed || profile?.role === 'admin';

    if (!subject) return <div className="p-8 text-white">Subject not found</div>;

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans" dir="rtl">
            {/* Header (Static Shell) */}
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <Link
                        href="/materials"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {subject.name}
                            </h1>
                        </div>
                        <p className="text-white/40 text-sm mt-1 flex items-center gap-2">
                            <BookOpen size={14} />
                            تصفح المحتوى التعليمي
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Grid with Suspense */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                {/* Left: Video Area (Taking up 8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Suspense fallback={
                        <div className="w-full aspect-video bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                            <Loader2 className="animate-spin text-white/20" />
                        </div>
                    }>
                        <ActiveVideoPlayer
                            lessonId={lessonId}
                            isSubscribed={isSubscribed}
                        />
                    </Suspense>

                    {/* Resources (Notes, etc) */}
                    <Suspense fallback={<Skeleton className="h-64 rounded-2xl bg-white/5" />}>
                        <LessonResourcesTabs
                            lessonId={lessonId}
                            isSubscribed={isSubscribed}
                        />
                    </Suspense>
                </div>

                {/* Right: Sidebar (Taking up 4 cols) - Sidebar fetches its own hierarchy */}
                <div className="lg:col-span-4 h-full">
                    <Suspense fallback={
                        <div className="h-full bg-white/5 rounded-2xl animate-pulse space-y-4 p-4">
                            <Skeleton className="h-8 w-1/2 bg-white/10" />
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full bg-white/5" />
                                <Skeleton className="h-12 w-full bg-white/5" />
                                <Skeleton className="h-12 w-full bg-white/5" />
                            </div>
                        </div>
                    }>
                        <CourseCurriculumSidebar
                            subjectId={subjectId}
                            activeLessonId={lessonId}
                        />
                    </Suspense>
                </div>

            </div>
        </div>
    );
}

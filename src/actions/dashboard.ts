"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export interface DashboardData {
    user: any;
    profile: any;
    subjects: any[];
    stats: {
        courses: number;
        hours: number;
        rank: string;
    };
    isSubscribed: boolean;
}

export async function getDashboardData(): Promise<DashboardData> {
    // Legacy support wrapper
    const api = await import("@/actions/dashboard"); // Self-import to use new functions
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const [profile, subjects, stats] = await Promise.all([
        api.getProfileData(user.id),
        api.getSubjectsData(),
        api.getStatsData()
    ]);

    return {
        user,
        profile,
        subjects,
        stats,
        isSubscribed: profile?.is_subscribed || false
    };
}

// ----------------------------------------------------------------------
// GRANULAR ACTIONS (For Streaming)
// ----------------------------------------------------------------------

export async function getProfileData(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
}

import { unstable_cache } from "next/cache";

// NEW: Import Strict DTO
import { SubjectDTO } from "@/types/subject";

export async function getSubjectsData(): Promise<SubjectDTO[]> {
    return await unstable_cache(
        async () => {
            const supabase = await createClient();
            const { data } = await supabase
                .from('subjects')
                .select('id, name, icon, description, color, slug, lesson_count, lessons(id, title, required_plan_id, is_free)') // Explicit select
                .in('name', ['Mathematics', 'Physics', 'الرياضيات', 'الفيزياء']) // Strict Filtering
                .order('order_index', { ascending: true });

            if (!data) return [];

            // Transform Raw DB Response to Strict DTO
            return data.map((subject: any) => ({
                id: subject.id,
                name: subject.name,
                icon: subject.icon,
                description: subject.description,
                color: subject.color,
                slug: subject.slug || subject.id, // Fallback if slug missing
                lessonCount: subject.lesson_count || 0,
                // ... rest mapped below
                lessons: Array.isArray(subject.lessons)
                    ? subject.lessons.map((l: any) => ({
                        id: l.id,
                        title: l.title
                    }))
                    : [],
                progress: 0 // Default, will be merged later if needed
            }));
        },
        ['dashboard-subjects-structure'],
        {
            revalidate: 3600, // Cache for 1 hour (or until manually purged)
            tags: ['dashboard-structure']
        }
    )();
}

// Helper to parse duration string "MM:SS" or "HH:MM:SS" to minutes
function parseDurationToMinutes(duration: string): number {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] + parts[1] / 60; // MM:SS
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60; // HH:MM:SS
    return 0;
}

export async function getStatsData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { courses: 0, hours: 0, rank: "#--" };

    // 1. Available Courses Count
    const { count: coursesCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });

    // 2. Learning Hours (Join user_progress -> lessons)
    const { data: progress } = await supabase
        .from('user_progress')
        .select(`
            lesson_id,
            lessons (
                duration
            )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true);

    let totalMinutes = 0;
    if (progress) {
        progress.forEach((p: any) => {
            if (p.lessons?.duration) {
                totalMinutes += parseDurationToMinutes(p.lessons.duration);
            }
        });
    }

    // Round to 1 decimal place
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // 3. Rank (Dynamic Tier System based on progress)
    // Calculated based on verified completed lessons.
    const completedCount = progress?.length || 0;
    let rank = "مبتدئ"; // Novice
    if (completedCount > 10) rank = "مجتهد"; // Intermediate
    if (completedCount > 50) rank = "نخبة"; // Elite

    return {
        courses: coursesCount || 0,
        hours: totalHours,
        rank: rank
    };
}

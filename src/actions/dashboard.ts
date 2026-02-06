"use server";

import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { RANK_SYSTEM } from "@/lib/constants";

// --- STRICT TYPES ---

export interface DashboardProfile {
    id: string;
    full_name?: string;
    email?: string;
    wilaya_id?: string;
    major_id?: string;
    role: "admin" | "student";
    is_subscribed: boolean;
    // Add other fields as necessary from UserProfile
}

export interface DashboardSubject {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    slug: string;
    lessonCount: number;
    lessons: { id: string; title: string }[];
    progress: number;
}

export interface DashboardStats {
    courses: number;
    hours: number;
    rank: string;
}

export interface DashboardData {
    user: User;
    profile: DashboardProfile | null;
    subjects: DashboardSubject[];
    stats: DashboardStats;
    isSubscribed: boolean;
}

// --- ACTIONS ---

export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const [profile, subjects, stats] = await Promise.all([
        getProfileData(user.id),
        getSubjectsData(),
        getStatsData(user.id)
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

export async function getProfileData(userId: string): Promise<DashboardProfile | null> {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (!data) return null;

    return {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        wilaya_id: data.wilaya_id,
        major_id: data.major_id,
        role: data.role,
        is_subscribed: data.is_subscribed
    };
}

export async function getSubjectsData(): Promise<DashboardSubject[]> {
    return await unstable_cache(
        async () => {
            const supabase = await createClient();
            const { data } = await supabase
                .from('subjects')
                .select('id, name, icon, description, color, slug, lesson_count, lessons(id, title, required_plan_id, is_free)') // Explicit select
                .eq('published', true) // FILTER: Only published subjects
                .in('name', ['Mathematics', 'Physics', 'الرياضيات', 'الفيزياء']) // Strict Filtering
                .order('order_index', { ascending: true });

            if (!data) return [];

            interface RawSubject {
                id: string; name: string; icon: string; description: string; color: string; slug: string; lesson_count: number;
                lessons?: { id: string; title: string; required_plan_id: string | null; is_free: boolean }[];
            }
            // Transform Raw DB Response to Strict DTO
            return (data as RawSubject[]).map((subject) => ({
                id: subject.id,
                name: subject.name,
                icon: subject.icon,
                description: subject.description,
                color: subject.color,
                slug: subject.slug || subject.id, // Fallback if slug missing
                lessonCount: subject.lesson_count || 0,
                lessons: Array.isArray(subject.lessons)
                    ? subject.lessons.map((l) => ({
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

export async function getStatsData(userId: string): Promise<DashboardStats> {
    const supabase = await createClient();

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
        .eq('user_id', userId)
        .eq('is_completed', true);

    let totalMinutes = 0;
    interface ProgressEntry { lesson_id: string; lessons: { duration: string } | { duration: string }[] | null }
    if (progress) {
        (progress as unknown as ProgressEntry[]).forEach((p) => {
            const lesson = Array.isArray(p.lessons) ? p.lessons[0] : p.lessons;
            if (lesson?.duration) {
                totalMinutes += parseDurationToMinutes(lesson.duration);
            }
        });
    }

    // Round to 1 decimal place
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // 3. Rank (Dynamic Tier System based on progress)
    // Calculated based on verified completed lessons.
    const completedCount = progress?.length || 0;

    type RankLabel = typeof RANK_SYSTEM[keyof typeof RANK_SYSTEM]['LABEL'];
    let rank: RankLabel = RANK_SYSTEM.NOVICE.LABEL;
    if (completedCount >= RANK_SYSTEM.ELITE.THRESHOLD) {
        rank = RANK_SYSTEM.ELITE.LABEL;
    } else if (completedCount >= RANK_SYSTEM.INTERMEDIATE.THRESHOLD) {
        rank = RANK_SYSTEM.INTERMEDIATE.LABEL;
    }

    return {
        courses: coursesCount || 0,
        hours: totalHours,
        rank: rank
    };
}

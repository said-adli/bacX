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

export async function getDashboardData(): Promise<DashboardData | { error: string }> {
    // Legacy support wrapper
    const api = await import("@/actions/dashboard"); // Self-import to use new functions
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

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

export async function getSubjectsData() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('subjects')
        .select('*, icon, lessons(id, title, required_plan_id, is_free)') // Fetch access info
        .in('name', ['Mathematics', 'Physics', 'الرياضيات', 'الفيزياء']) // Strict Filtering
        .order('order_index', { ascending: true });

    return data || [];
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

    // 3. Rank (Mocking logic based on points/completed lessons vs global average for now)
    // Real implementation would require a 'points' column or complex aggregation.
    // For now, let's make it semi-dynamic:
    const completedCount = progress?.length || 0;
    let rank = "#--";
    if (completedCount > 0) rank = "#842"; // Placeholder for 'Active Student'
    if (completedCount > 10) rank = "#156";
    if (completedCount > 50) rank = "#12";

    return {
        courses: coursesCount || 0,
        hours: totalHours,
        rank: rank
    };
}

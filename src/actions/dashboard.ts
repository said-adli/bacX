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

export async function getStatsData() {
    const supabase = await createClient();
    // Optimized: Use count instead of fetching all rows
    const { count } = await supabase.from('subjects').select('*', { count: 'exact', head: true });

    return {
        courses: count || 0,
        hours: 0, // Placeholder
        rank: "#--"
    };
}

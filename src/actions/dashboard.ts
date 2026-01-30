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
    const supabase = await createClient();

    try {
        // 1. Get User Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("[Dashboard] Auth Error:", authError);
            return { error: "Unauthorized" };
        }

        // 2. Parallel Fetching for Performance
        const [profileResult, subjectsResult, statsResult] = await Promise.all([
            // Fetch Profile
            supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single(),

            // Fetch Subjects (and lessons count if needed)
            supabase
                .from('subjects')
                .select('*, icon, lessons(id, title, required_plan_id, is_free)') // Fetch access info
                .in('name', ['Mathematics', 'Physics', 'الرياضيات', 'الفيزياء']) // Strict Filtering
                .order('order_index', { ascending: true }),

            // Fetch Stats (Count)
            supabase
                .from('subjects')
                .select('*', { count: 'exact', head: true })
        ]);

        const profile = profileResult.data;
        const subjects = subjectsResult.data || [];
        const subjectCount = statsResult.count || 0;

        // 3. Process Data
        // Calculate "Hours" or other derived stats here if possible
        // For now, placeholder or derived from real data
        const hours = 0; // Future: sum(lessons.duration)

        return {
            user,
            profile,
            subjects,
            stats: {
                courses: subjectCount,
                hours: hours,
                rank: "#--" // Placeholder for now
            },
            isSubscribed: profile?.is_subscribed || false
        };

    } catch (error) {
        console.error("[Dashboard] Critical Error:", error);
        return { error: "Internal Server Error" };
    }
}

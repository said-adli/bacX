"use server";

import { createClient } from "@/utils/supabase/server";

export async function getSecureVideoId(lessonId: string) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    // 2. Fetch User Profile (Role & Entitlement)
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, plan_id, is_subscribed')
        .eq('id', user.id)
        .single();

    if (!profile) throw new Error("Profile not found");

    // 3. Fetch Lesson Requirements
    const { data: lesson } = await supabase
        .from('lessons')
        .select('id, required_plan_id, is_free, video_url')
        .eq('id', lessonId)
        .single();

    if (!lesson) throw new Error("Lesson not found");

    // 4. Entitlement Logic
    // Admins bypass all checks
    if (profile.role === 'admin') {
        return lesson.video_url;
    }

    // Free lessons are open
    if (lesson.is_free) {
        return lesson.video_url;
    }

    // Plan-based restriction
    // If lesson has a specific plan requirement, user must match it
    if (lesson.required_plan_id) {
        if (profile.plan_id !== lesson.required_plan_id) {
            throw new Error("Upgrade required to view this lesson");
        }
    } else {
        // General subscription check logic (fallback)
        if (!profile.is_subscribed) {
            throw new Error("Active subscription required");
        }
    }

    // 5. Return Video ID
    // We assume video_url stores the YouTube ID (standard for this project)
    return lesson.video_url;
}

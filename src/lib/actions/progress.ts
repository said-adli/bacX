"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Toggles the completion status of a lesson for the current user.
 * Upserts the progress record.
 */
export async function toggleLessonCompletion(lessonId: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const { error } = await supabase
            .from("student_progress")
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                is_completed: isCompleted,
                last_watched_at: new Date().toISOString()
            }, {
                onConflict: "user_id, lesson_id"
            });

        if (error) throw error;

        revalidatePath(`/materials`);
        revalidatePath(`/materials/${lessonId}`); // Revalidate lesson page if dynamic
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling completion:", error);
        return { error: error.message };
    }
}

/**
 * Calculates the progress for a specific subject.
 * Returns { completed, total, percentage }
 */
export async function getSubjectProgress(subjectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { completed: 0, total: 0, percentage: 0 };

    try {
        // 1. Get all lesson IDs for this subject
        // We need to join units to get lessons for the subject
        const { data: lessons, error: lessonError } = await supabase
            .from("lessons")
            .select("id, unit_id, units!inner(subject_id)")
            .eq("units.subject_id", subjectId);

        if (lessonError || !lessons) throw lessonError;

        const totalLessons = lessons.length;
        if (totalLessons === 0) return { completed: 0, total: 0, percentage: 0 };

        const lessonIds = lessons.map(l => l.id);

        // 2. Count completed lessons from these IDs
        const { count, error: progressError } = await supabase
            .from("student_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .in("lesson_id", lessonIds);

        if (progressError) throw progressError;

        const completedCount = count || 0;
        const percentage = Math.round((completedCount / totalLessons) * 100);

        return {
            completed: completedCount,
            total: totalLessons,
            percentage
        };

    } catch (error) {
        console.error("Error calculating subject progress:", error);
        return { completed: 0, total: 0, percentage: 0 };
    }
}

/**
 * Gets the most recently watched lesson for the "Continue Watching" feature.
 */
export async function getLastAccessedLesson() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    try {
        const { data, error } = await supabase
            .from("student_progress")
            .select(`
                last_watched_at,
                lesson_id,
                lessons (
                    id,
                    title,
                    is_free,
                    video_url,
                    units (
                        id,
                        title,
                        subject_id,
                        subjects (
                            id,
                            name,
                            color
                        )
                    )
                )
            `)
            .eq("user_id", user.id)
            .order("last_watched_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) return null; // No history found

        return data;

    } catch (error) {
        console.error("Error fetching last accessed lesson:", error);
        return null;
    }
}

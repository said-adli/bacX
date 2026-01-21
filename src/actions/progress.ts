'use server';

import { createClient } from "@/utils/supabase/server";

export async function markLessonComplete(lessonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, lesson_id' });

    if (error) {
        console.error("Error marking lesson complete:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function getUserProgress(subjectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Ideally, we filter by subjectId if we joined tables.
    // For now, let's fetch all progress for simplicity or filter client side if needed.
    // BETTER: Get IDs of lessons for this subject FIRST, then check progress.
    // But to keep it efficient in one query:

    // 1. Get lesson IDs for subject
    const { data: lessons } = await supabase.from('lessons').select('id').eq('subject_id', subjectId);
    if (!lessons || lessons.length === 0) return [];

    const lessonIds = lessons.map(l => l.id);

    // 2. Get progress for these lessons
    const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

    return progress || [];
}

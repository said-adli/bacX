"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetches the specific lesson details including video, notes, and completion status.
 */
export async function getLessonData(lessonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        // 1. Fetch Lesson Metadata
        const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .select(`
                *,
                subscription_plans(id, name, price)
            `)
            .eq('id', lessonId)
            .single();

        if (lessonError) throw lessonError;

        // 2. Fetch Completion Status
        const { data: progress } = await supabase
            .from('student_progress')
            .select('is_completed, last_accessed_at')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

        // 3. Mark as "Last Accessed" (Side Effect - Fire and Forget mostly, but we define it here)
        // Ideally handled by separate action or background job to not block read

        return {
            lesson,
            isCompleted: progress?.is_completed || false,
        };

    } catch (error: any) {
        console.error("getLessonData Error:", error);
        return { error: error.message };
    }
}

/**
 * Fetches the subject hierarchy (Units -> Lessons)
 */
export async function getSubjectHierarchy(subjectId: string) {
    const supabase = await createClient();

    try {
        const { data: subject, error } = await supabase
            .from('subjects')
            .select('*, units(*, lessons(id, title, duration, is_free, unit_id))')
            .eq('id', subjectId)
            .single();

        if (error) throw error;

        // Sort Units and Lessons
        if (subject && subject.units) {
            subject.units.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            subject.units.forEach((unit: any) => {
                if (unit.lessons) {
                    unit.lessons.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                }
            });
        }

        return { subject };
    } catch (error: any) {
        console.error("getSubjectHierarchy Error:", error);
        return { error: error.message };
    }
}

/**
 * Toggles the completion status of a lesson.
 */
export async function toggleLessonCompletion(lessonId: string, currentState: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const newState = !currentState;

    try {
        const { error } = await supabase
            .from('student_progress')
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                is_completed: newState,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "user_id, lesson_id"
            });

        if (error) throw error;

        revalidatePath('/materials');
        return { success: true, isCompleted: newState };
    } catch (error: any) {
        return { error: error.message };
    }
}

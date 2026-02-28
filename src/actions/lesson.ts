"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetches the specific lesson details including video, notes, and completion status.
 */
export async function getLessonData(lessonId: string) {
    if (!lessonId || lessonId === "undefined" || typeof lessonId === "object") {
        console.error("CRITICAL: Blocked Supabase call with invalid ID:", lessonId);
        return { error: "Invalid lesson ID" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        // 1. POWER RPC: Fetch Profile, Lesson Metadata, and Ownership in ONE Trip
        const { data: context, error: rpcError } = await supabase
            .rpc('get_lesson_full_context', {
                p_lesson_id: lessonId,
                p_user_id: user.id
            });

        if (rpcError || !context || !context.lesson) {
            return { error: "Content not found or RPC failed" };
        }

        const { lesson, subject, user_context } = context as any;

        // 2. UNIFIED ACCESS CONTROL
        const { verifyContentAccess } = await import("@/lib/access-control");
        const profile = user_context.profile;
        const activeIds = user_context.owns_content ? [lesson.id] : [];

        const contentRequirement = {
            id: lesson.id,
            required_plan_id: lesson.required_plan_id,
            is_free: lesson.is_free,
            is_active: subject.is_active
        };

        const access = await verifyContentAccess({
            ...profile,
            owned_content_ids: activeIds
        }, contentRequirement);

        if (!access.allowed) {
            return { error: access.reason || "Access Denied" };
        }

        // 3. Fetch Completion Status
        const { data: progress } = await supabase
            .from('user_progress')
            .select('is_completed, last_accessed_at')
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .maybeSingle();

        // 5. Mark as "Last Accessed" (Side Effect - Fire and Forget mostly, but we define it here)
        // Ideally handled by separate action or background job to not block read

        return {
            lesson,
            isCompleted: progress?.is_completed || false,
        };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("getLessonData Error:", error);
        return { error: message };
    }
}

/**
 * Fetches the subject hierarchy (Units -> Lessons)
 */
export async function getSubjectHierarchy(subjectId: string) {
    if (!subjectId || subjectId === "undefined" || typeof subjectId === "object") {
        console.error("CRITICAL: Blocked Supabase call with invalid ID:", subjectId);
        return { error: "Invalid subject ID" };
    }

    const supabase = await createClient();

    try {
        const { data: subject, error } = await supabase
            .from('subjects')
            .select('*, units(*, lessons(id, title, duration, is_free, unit_id))')
            .eq('id', subjectId)
            .eq('is_active', true) // STRICT: Only active subjects
            .single();

        if (error) throw error;

        // Sort Units and Lessons
        interface UnitWithMeta { created_at: string; lessons?: { created_at: string }[] }
        if (subject && subject.units) {
            (subject.units as UnitWithMeta[]).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            (subject.units as UnitWithMeta[]).forEach((unit) => {
                if (unit.lessons) {
                    unit.lessons.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                }
            });
        }

        return { subject };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("getSubjectHierarchy Error:", error);
        return { error: message };
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
        // SCHEMA FIX: Using 'user_progress' (not 'student_progress') per official schema
        const { error } = await supabase
            .from('user_progress')
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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: message };
    }
}

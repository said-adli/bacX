"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Saves (Upserts) a note for a specific lesson.
 */
export async function saveNote(lessonId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const { error } = await supabase
            .from("lesson_notes")
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                content: content,
                updated_at: new Date().toISOString()
            }, {
                onConflict: "user_id, lesson_id"
            });

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Error saving note:", error);
        return { error: error.message };
    }
}

/**
 * Retrieves the note for a specific lesson.
 */
export async function getNote(lessonId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null };
    }

    try {
        const { data, error } = await supabase
            .from("lesson_notes")
            .select("content, updated_at")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .single();

        if (error) return { data: null };

        return { data };
    } catch (error) {
        console.error("Error getting note:", error);
        return { data: null, error };
    }
}

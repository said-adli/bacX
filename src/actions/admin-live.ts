"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/admin-logger";

export interface LiveSession {
    id: string;
    title: string;
    youtube_id: string; // Database column
    status: 'scheduled' | 'live' | 'ended';
    start_time: string; // Database column
    required_plan_id?: string | null;
    is_purchasable: boolean;
    price?: number | null;
    published: boolean;
    lesson_id?: string | null;
    created_at: string;
}

// Update DTO to use standardized names
export type NewLiveSessionPayload = {
    title: string;
    stream_url: string; // Mapped to youtube_id
    scheduled_at: string; // Mapped to start_time
    status?: string;
    required_plan_id?: string | null;
    is_purchasable?: boolean;
    price?: number | null;
    published?: boolean;
    lesson_id?: string | null;
};

export async function getLiveSessions() {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('live_sessions')
        .select(`
            *,
            subscription_plans(name)
        `)
        .order('start_time', { ascending: false });

    if (error) {
        console.error("Fetch Live Sessions Error", error);
        return [];
    }

    return data as (LiveSession & { subscription_plans?: { name: string } })[];
}

export async function createLiveSession(data: NewLiveSessionPayload) {
    await requireAdmin();
    const supabase = await createClient();

    const { data: newSession, error } = await supabase
        .from('live_sessions')
        .insert({
            title: data.title,
            youtube_id: data.stream_url, // MAP: stream_url -> youtube_id
            start_time: data.scheduled_at, // MAP: scheduled_at -> start_time
            status: data.status || 'scheduled',
            required_plan_id: data.required_plan_id || null,
            is_purchasable: data.is_purchasable ?? false,
            price: data.price ?? null,
            published: data.published ?? true,
            lesson_id: data.lesson_id ?? null
        })
        .select()
        .single();

    if (error) throw error;
    await logAdminAction("CREATE_LIVE", newSession.id, "live_session", { title: data.title });

    // Comprehensive Revalidation
    revalidatePath('/admin/live');
    revalidatePath('/admin/content');
    revalidatePath('/dashboard');

    return newSession;
}

export async function updateLiveSession(id: string, data: Partial<NewLiveSessionPayload>) {
    await requireAdmin();
    const supabase = await createClient();

    // 1. Update Live Session
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.stream_url !== undefined) updateData.youtube_id = data.stream_url; // MAP
    if (data.scheduled_at !== undefined) updateData.start_time = data.scheduled_at; // MAP
    if (data.status !== undefined) updateData.status = data.status;
    if (data.required_plan_id !== undefined) updateData.required_plan_id = data.required_plan_id;
    if (data.is_purchasable !== undefined) updateData.is_purchasable = data.is_purchasable;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.published !== undefined) updateData.published = data.published;
    if (data.lesson_id !== undefined) updateData.lesson_id = data.lesson_id;

    const { error } = await supabase
        .from('live_sessions')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;

    // 2. DUAL UPDATE: Sync Lesson if linked
    // We need to fetch the existing session to get the lesson_id if not provided in payload, 
    // or use the one in payload.
    // However, to be safe and atomic-ish, let's just update if we have a lesson_id.
    // Optimization: If we didn't change title/access, skip. But "Consistency" is key.

    let targetLessonId = data.lesson_id;

    // If not in payload, fetch from DB? Or assumes caller passes it? 
    // The instructions say "Update the corresponding record in the lessons table".
    // We should probably fetch the current session to get the lesson_id if we don't have it.
    if (!targetLessonId) {
        const { data: current } = await supabase.from('live_sessions').select('lesson_id').eq('id', id).single();
        if (current?.lesson_id) targetLessonId = current.lesson_id;
    }

    if (targetLessonId && (data.title || data.stream_url || data.scheduled_at)) {
        const lessonUpdate: any = {};
        if (data.title) lessonUpdate.title = data.title;
        // Map fields that exist in lessons
        if (data.stream_url) lessonUpdate.video_url = data.stream_url; // Assuming video_url holds the stream ID/URL for Lessons too
        // Lessons doesn't have scheduled_at/start_time usually visible/used for sorting, but maybe in metadata? 
        // For now, syncing Title and Video URL is the most critical visual sync in Content Tree.

        const { error: lessonError } = await supabase
            .from('lessons')
            .update(lessonUpdate)
            .eq('id', targetLessonId);

        if (lessonError) console.error("Failed to sync lesson:", lessonError);
    }

    await logAdminAction("UPDATE_LIVE", id, "live_session", data);

    // Comprehensive Revalidation
    revalidatePath('/admin/live');
    revalidatePath('/admin/content');
    revalidatePath('/dashboard');
}

export async function deleteLiveSession(id: string) {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from('live_sessions').delete().eq('id', id);

    if (error) throw error;
    await logAdminAction("DELETE_LIVE", id, "live_session", {});

    // Comprehensive Revalidation
    revalidatePath('/admin/live');
    revalidatePath('/admin/content');
    revalidatePath('/dashboard');
}

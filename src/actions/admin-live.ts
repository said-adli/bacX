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
    started_at: string; // Database column
    required_plan_id?: string | null;
    is_purchasable: boolean;
    price?: number | null;
    is_active: boolean;
    lesson_id?: string | null;
    created_at: string;
}

// Update DTO to use standardized names
export type NewLiveSessionPayload = {
    title: string;
    stream_url: string; // Mapped to youtube_id
    scheduled_at: string; // Mapped to started_at
    status?: string;
    required_plan_id?: string | null;
    is_purchasable?: boolean;
    price?: number | null;
    is_active?: boolean;
    lesson_id?: string | null;
    description?: string; // Added for completeness in RPC
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
        .order('started_at', { ascending: false });

    if (error) {
        console.error("Fetch Live Sessions Error", error);
        return [];
    }

    return data as (LiveSession & { subscription_plans?: { name: string } })[];
}

export async function createLiveSession(data: NewLiveSessionPayload) {
    await requireAdmin();
    const supabase = await createClient();

    // 1. Strict Date Validation
    if (!data.scheduled_at) {
        throw new Error("Validation Error: Scheduled time is required.");
    }
    // Simple check if it's a valid date structure (browser ISO string)
    // We can also let Postgres handle it, but failing fast is better.
    const scheduledDate = new Date(data.scheduled_at);
    if (isNaN(scheduledDate.getTime())) {
        throw new Error("Validation Error: Invalid scheduled date format.");
    }
    const safeStartTime = scheduledDate.toISOString();


    const { data: newSession, error } = await supabase
        .from('live_sessions')
        .insert({
            title: data.title,
            youtube_id: data.stream_url, // MAP: stream_url -> youtube_id
            started_at: safeStartTime, // MAP: scheduled_at -> started_at (Validated)
            status: data.status || 'scheduled',
            required_plan_id: data.required_plan_id || null,
            is_purchasable: data.is_purchasable ?? false,
            price: data.price ?? null,
            is_active: data.is_active ?? true,
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

    // 1. Strict Date Validation (if provided)
    let safeStartTime: string | undefined;
    if (data.scheduled_at) {
        const d = new Date(data.scheduled_at);
        if (isNaN(d.getTime())) {
            throw new Error("Validation Error: Invalid scheduled date format.");
        }
        safeStartTime = d.toISOString();
    }

    // 2. Resolve Lesson ID (if not provided but needed for RPC)
    // If we want to atomically update the lesson, we need its ID.
    // If data.lesson_id is provided, use it. If not, fetch it.
    let targetLessonId = data.lesson_id;
    if (targetLessonId === undefined) {
        // Optimization: Only fetch if we are actually updating fields that sync (title, dest, time)
        // But for RPC simplicty, let's just fetch.
        const { data: current } = await supabase.from('live_sessions').select('lesson_id').eq('id', id).single();
        if (current?.lesson_id) targetLessonId = current.lesson_id;
    }

    // 3. Call ATOMIC RPC
    // We pass all fields. Standardize undefined to null for RPC if needed,
    // but Postgres function defaults handle nulls if we don't pass them?
    // Actually, calling RPC from JS client passes undefined as missing param usually?
    // No, Supabase RPC params are named. We should pass explicit nulls or values.
    // But our RPC has DEFAULT NULL, so we can omit them.

    const rpcParams: Record<string, unknown> = {
        p_session_id: id,
        p_lesson_id: targetLessonId || null, // Pass null if no lesson linked
        p_title: data.title,
        p_description: data.description, // DTO doesn't have description yet but RPC supports it.
        p_started_at: safeStartTime,
        p_youtube_id: data.stream_url,
        // Optional status updates
        p_status: data.status,
        p_is_purchasable: data.is_purchasable,
        p_price: data.price,
        p_is_active: data.is_active,
        p_required_plan_id: data.required_plan_id
    };

    // Remove undefined keys so RPC uses defaults (which are NULL/Ignore in our SQL logic)
    Object.keys(rpcParams).forEach(key => rpcParams[key] === undefined && delete rpcParams[key]);

    const { error } = await supabase.rpc('update_live_session_and_lesson', rpcParams);

    if (error) {
        console.error("Atomic Update Failed:", error);
        throw error;
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

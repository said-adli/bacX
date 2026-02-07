"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/admin-logger";

export interface LiveSession {
    id: string;
    title: string;
    youtube_id: string;
    status: 'scheduled' | 'live' | 'ended';
    start_time: string; // timestamp
    required_plan_id?: string | null;
    is_purchasable: boolean;
    price?: number | null;
    published: boolean;
    lesson_id?: string | null;
    created_at: string;
}

export type NewLiveSessionPayload = Omit<LiveSession, 'id' | 'created_at' | 'status'> & { status?: string };

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
            youtube_id: data.youtube_id,
            start_time: data.start_time,
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
    revalidatePath('/admin/live');
    revalidatePath('/dashboard');
    return newSession;
}

export async function updateLiveSession(id: string, data: Partial<NewLiveSessionPayload>) {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
        .from('live_sessions')
        .update({
            title: data.title,
            youtube_id: data.youtube_id,
            start_time: data.start_time,
            status: data.status,
            required_plan_id: data.required_plan_id,
            is_purchasable: data.is_purchasable,
            price: data.price,
            published: data.published,
            lesson_id: data.lesson_id
        })
        .eq('id', id);

    if (error) throw error;
    await logAdminAction("UPDATE_LIVE", id, "live_session", data);
    revalidatePath('/admin/live');
    revalidatePath('/dashboard');
}

export async function deleteLiveSession(id: string) {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.from('live_sessions').delete().eq('id', id);

    if (error) throw error;
    await logAdminAction("DELETE_LIVE", id, "live_session", {});
    revalidatePath('/admin/live');
    revalidatePath('/dashboard');
}

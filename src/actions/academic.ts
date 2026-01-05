'use server';

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");
    return createAdminClient();
}

// SUBJECTS
export async function createSubject(data: any) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('subjects').insert({
            name: data.name,
            icon: data.icon,
            order: data.order
        });
        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

export async function deleteSubject(id: string) {
    try {
        const admin = await requireAdmin();
        // Cascade delete should handle units/lessons if set up in DB. 
        // If not, we might need manual cleanup. Assuming DB cascade.
        const { error } = await admin.from('subjects').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

// UNITS
export async function createUnit(subjectId: string, data: any) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('units').insert({
            subject_id: subjectId,
            name: data.name,
            order: data.order
        });
        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

export async function deleteUnit(id: string) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('units').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

// LESSONS
export async function createLesson(unitId: string, data: any) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('lessons').insert({
            unit_id: unitId,
            title: data.title,
            video_url: data.videoUrl,
            duration: data.duration,
            is_free: data.isFree,
            order: data.order,
            created_at: new Date().toISOString()
        });
        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

export async function deleteLesson(id: string) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('lessons').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

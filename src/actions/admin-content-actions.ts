'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { verifyAdmin } from "@/utils/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";

// --- Types ---
export interface Subject {
    id: string;
    name: string;
    icon: string;
    order: number;
    units?: Unit[];
}

export interface Unit {
    id: string;
    subject_id: string;
    name: string;
    order: number;
    lessons?: Lesson[];
}

export interface Lesson {
    id: string;
    unit_id: string;
    title: string;
    video_url: string;
    duration: string;
    is_free: boolean;
    order: number;
}

// --- Fetcher ---
export async function getContentHierarchy() {
    try {
        await verifyAdmin();
        const supabase = createAdminClient();

        // Fetch deep hierarchy: Subjects -> Units -> Lessons
        const { data: subjects, error } = await supabase
            .from('subjects')
            .select(`
        *,
        units (
          *,
          lessons (*)
        )
      `)
            .order('order', { ascending: true }); // Subject order

        if (error) throw error;

        // Sort children manually since Supabase nested ordering can be tricky in one go
        const sortedSubjects = subjects.map((sub: any) => ({
            ...sub,
            units: sub.units
                ?.sort((a: any, b: any) => a.order - b.order)
                .map((unit: any) => ({
                    ...unit,
                    lessons: unit.lessons?.sort((a: any, b: any) => a.order - b.order)
                }))
        })) as Subject[];

        return { subjects: sortedSubjects };

    } catch (err) {
        console.error("Error fetching content:", err);
        return { subjects: [] };
    }
}

// --- Subject Actions ---
export async function createSubject(data: { name: string; icon: string; order: number }) {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();

        const { error } = await supabase.from('subjects').insert(data);
        if (error) throw error;

        await logAdminAction({ adminId: user.id, action: "CREATE_CONTENT", details: { type: 'subject', name: data.name } });
        revalidatePath('/admin/content');
        return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
}

export async function deleteSubject(id: string) {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();
        // Assuming cascade delete is ON in DB. If not, we fail.
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) throw error;

        await logAdminAction({ adminId: user.id, action: "DELETE_CONTENT", targetId: id, details: { type: 'subject' } });
        revalidatePath('/admin/content');
        return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
}

// --- Unit Actions ---
export async function createUnit(data: { subject_id: string; name: string; order: number }) {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();
        const { error } = await supabase.from('units').insert(data);
        if (error) throw error;

        await logAdminAction({ adminId: user.id, action: "CREATE_CONTENT", details: { type: 'unit', name: data.name } });
        revalidatePath('/admin/content');
        return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
}

export async function deleteUnit(id: string) {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();
        const { error } = await supabase.from('units').delete().eq('id', id);
        if (error) throw error;

        await logAdminAction({ adminId: user.id, action: "DELETE_CONTENT", targetId: id, details: { type: 'unit' } });
        revalidatePath('/admin/content');
        return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
}

// --- Lesson Actions ---
export async function createLesson(data: { unit_id: string; title: string; videoUrl: string; duration: string; isFree: boolean; order: number }) {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();

        const { error } = await supabase.from('lessons').insert({
            unit_id: data.unit_id,
            title: data.title,
            video_url: data.videoUrl,
            duration: data.duration,
            is_free: data.isFree,
            order: data.order
        });
        if (error) throw error;

        await logAdminAction({ adminId: user.id, action: "CREATE_CONTENT", details: { type: 'lesson', title: data.title } });
        revalidatePath('/admin/content');
        return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
}

export async function deleteLesson(id: string) {
    try {
        const { user } = await verifyAdmin();
        const supabase = createAdminClient();
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) throw error;

        await logAdminAction({ adminId: user.id, action: "DELETE_CONTENT", targetId: id, details: { type: 'lesson' } });
        revalidatePath('/admin/content');
        return { success: true };
    } catch (e) { return { success: false, error: String(e) }; }
}

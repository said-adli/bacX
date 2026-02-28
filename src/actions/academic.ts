'use server';


import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

// Types
interface SubjectData { name: string; icon: string; order_index: number; }
interface UnitData { name: string; order_index: number; }
interface LessonData { title: string; videoUrl: string; duration: string; isFree: boolean; order_index: number; }

// SUBJECTS
export async function createSubject(data: SubjectData) {
    try {
        await requireAdmin();
        const admin = createAdminClient();
        const { error } = await admin.from('subjects').insert({
            name: data.name,
            icon: data.icon,
            order_index: data.order_index
        });
        if (error) throw error;
        revalidatePath('/admin/content');
        revalidatePath('/admin/live');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

export async function deleteSubject(id: string) {
    try {
        await requireAdmin();
        const admin = createAdminClient();
        // Cascade delete should handle units/lessons if set up in DB. 
        // If not, we might need manual cleanup. Assuming DB cascade.
        const { error } = await admin.from('subjects').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/admin/content');
        revalidatePath('/admin/live');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

// UNITS
export async function createUnit(subjectId: string, data: UnitData) {
    try {
        await requireAdmin();
        const admin = createAdminClient();
        const { error } = await admin.from('units').insert({
            subject_id: subjectId,
            title: data.name,
            order_index: data.order_index
        });
        if (error) throw error;
        revalidatePath('/admin/content');
        revalidatePath('/admin/live');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}

export async function deleteUnit(id: string) {
    try {
        await requireAdmin();
        const admin = createAdminClient();
        const { error } = await admin.from('units').delete().eq('id', id);
        if (error) throw error;
        revalidatePath('/admin/content');
        revalidatePath('/admin/live');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) { return { success: false, message: String(e) }; }
}



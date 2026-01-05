'use server';

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Helpers
async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check role? Or assume adminClient is safe if guarding with requireAdmin?
    // Double check role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    return createAdminClient();
}

export async function createPlan(data: any) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('plans').insert({
            title: data.title,
            price: data.price,
            duration_days: data.durationDays,
            features: data.features,
            is_active: data.isActive,
            is_popular: data.isPopular,
            created_at: new Date().toISOString()
        });
        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}

export async function updatePlan(id: string, data: any) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('plans').update({
            title: data.title,
            price: data.price,
            duration_days: data.durationDays,
            features: data.features,
            is_active: data.isActive,
            is_popular: data.isPopular,
            updated_at: new Date().toISOString()
        }).eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}

export async function deletePlan(id: string) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('plans').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}

export async function togglePlanStatus(id: string, currentStatus: boolean) {
    try {
        const admin = await requireAdmin();
        const { error } = await admin.from('plans').update({ is_active: !currentStatus }).eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}

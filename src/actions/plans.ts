'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";

interface PlanData {
    title: string;
    price: string;
    durationDays: number;
    features: string[];
    isActive: boolean;
    isPopular: boolean;
}

export async function createPlan(data: PlanData) {
    try {
        await requireAdmin();
        const adminClient = createAdminClient();
        const { error } = await adminClient.from('plans').insert({
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

export async function updatePlan(id: string, data: PlanData) {
    try {
        await requireAdmin();
        const adminClient = createAdminClient();
        const { error } = await adminClient.from('plans').update({
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
        await requireAdmin();
        const adminClient = createAdminClient();
        const { error } = await adminClient.from('plans').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}

export async function togglePlanStatus(id: string, currentStatus: boolean) {
    try {
        await requireAdmin();
        const adminClient = createAdminClient();
        const { error } = await adminClient.from('plans').update({ is_active: !currentStatus }).eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        return { success: false, message: String(e) };
    }
}


"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    discount_price?: number | null;
    description?: string;
    features: string[];
    is_active: boolean;
    // New Fields
    duration_days: number;
    type: 'subscription' | 'course';
}

// ADMIN ACTIONS (Secure)
export async function getAdminPlans() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) throw new Error("Unauthorized");

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SubscriptionPlan[];
}

export async function createPlan(data: Omit<SubscriptionPlan, "id" | "is_active">) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { error } = await supabase
        .from('subscription_plans')
        .insert([{
            ...data,
            is_active: true
        }]);

    if (error) throw error;
    revalidatePath('/admin/offers');
    revalidatePath('/subscription');
}

export async function updatePlan(id: string, data: Partial<SubscriptionPlan>) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { error } = await supabase
        .from('subscription_plans')
        .update(data)
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/offers');
    revalidatePath('/subscription');
}

export async function deletePlan(id: string) {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/offers');
    revalidatePath('/subscription');
}

// PUBLIC ACTIONS
export async function getActivePlans() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

    if (error) {
        console.error("Error fetching plans:", error);
        return [];
    }
    return data as SubscriptionPlan[];
}

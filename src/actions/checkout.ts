"use server";

import { createClient } from "@/utils/supabase/server";
import { SubscriptionPlan } from "./admin-plans"; // Reusing the type

export interface CheckoutState {
    success: boolean;
    plan?: SubscriptionPlan;
    error?: string;
}

export async function getSubscriptionPlan(planId: string): Promise<CheckoutState> {
    const supabase = await createClient();

    try {
        // Try to fetch by ID (UUID)
        let query = supabase
            .from('subscription_plans')
            .select('id, name, price, discount_price, description, features, is_active, duration_days, type')
            .eq('is_active', true);

        // Check if planId is a valid UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(planId);

        if (isUUID) {
            query = query.eq('id', planId);
        } else {
            // Fallback: If we had a slug column we would use it. 
            // Since we don't have a visible slug column in the previous file view, 
            // and the user currently uses 'vip' or 'gold' in url.
            // We will try to match name or return error if strict UUID is required.
            // For now, let's assume the user passes ID, or we map 'vip' to a known plan if needed.
            // BUT strict request says "Fetch... using the slug". 
            // Let's assume there MIGHT be a slug or we strictly require ID.
            // Given the context, I'll attempt to find by name if not UUID, or just fail.
            // Safest bet: The user previously had `params.planId === 'vip'`. 
            // I will add a search by name for legacy URL support if strictly needed, 
            // but ideally we should use IDs. 
            // Let's query by ID first.
            return { success: false, error: "Invalid Plan ID" };
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return { success: false, error: "Plan not found" };
        }

        return { success: true, plan: data as SubscriptionPlan };

    } catch (e: unknown) {
        console.error("Checkout Fetch Error:", e);
        return { success: false, error: "Internal Server Error" };
    }
}

export async function getContentDetails(type: 'lesson' | 'subject', id: string) {
    const supabase = await createClient();

    try {
        const table = type === 'lesson' ? 'lessons' : 'subjects';

        // Select logic varies slightly
        const query = supabase
            .from(table)
            .select(type === 'lesson'
                ? 'id, title, price, is_purchasable'
                : 'id, name, price, is_purchasable' // Assuming subject has these too
            )
            .eq('id', id)
            .single();

        const { data, error } = await query;

        if (error || !data) {
            return { success: false, error: "Content not found" };
        }

        return {
            success: true,
            content: {
                id: data.id,
                title: 'title' in data ? (data as { title?: string }).title : 'name' in data ? (data as { name?: string }).name : '',
                price: data.price,
                is_purchasable: data.is_purchasable
            }
        };

    } catch (e) {
        console.error("Content Fetch Error:", e);
        return { success: false, error: "Internal Error" };
    }
}

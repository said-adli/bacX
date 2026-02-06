"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
    id: string;
    code: string;
    discount_type: DiscountType;
    value: number;
    max_uses: number;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    is_lifetime?: boolean;
}

// ... existing code ...

/**
 * Creates a new coupon (Admin only)
 */
export async function createCoupon(data: Partial<Coupon>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Admin Role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from('coupons')
        .insert([{
            ...data,
            used_count: 0, // Force 0
            code: data.code?.toUpperCase(), // Normalize
            is_lifetime: data.is_lifetime || false
        }]);

    if (error) throw error;
    revalidatePath('/admin');
}

/**
 * Deletes a coupon (Admin only)
 */
export async function deleteCoupon(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const adminClient = createAdminClient();
    const { error } = await adminClient.from('coupons').delete().eq('id', id);

    if (error) throw error;
    revalidatePath('/admin');
}

/**
 * Uses a coupon (Commit) - Should be called on successful payment
 */
export async function incrementCouponUsage(code: string) {
    const adminClient = createAdminClient();
    // Call the atomic function
    const { error } = await adminClient.rpc('increment_coupon_usage', { coupon_code: code });
    if (error) console.error("Failed to increment coupon:", error);
}

/**
 * Fetch all coupons (Admin only)
 */
export async function getCoupons() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching coupons:", error);
        throw new Error("Failed to fetch coupons");
    }

    return data as Coupon[];
}

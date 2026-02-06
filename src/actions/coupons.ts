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

export interface CouponValidationResult {
    valid: boolean;
    message?: string;
    finalPrice: number;
    coupon?: Coupon;
}

/**
 * Validates a coupon and returns the calculated price
 */
export async function validateCoupon(code: string, originalPrice: number): Promise<CouponValidationResult> {
    const supabase = await createClient();

    // Normalize code
    const normalizedCode = code.trim().toUpperCase();

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', normalizedCode)
        .single();

    if (error || !coupon) {
        return { valid: false, message: "Invalid coupon code", finalPrice: originalPrice };
    }

    // 1. Check Active Status
    if (!coupon.is_active) {
        return { valid: false, message: "Coupon is inactive", finalPrice: originalPrice };
    }

    // 2. Check Expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { valid: false, message: "Coupon has expired", finalPrice: originalPrice };
    }

    // 3. Check Usage Limits
    if (coupon.used_count >= coupon.max_uses) {
        return { valid: false, message: "Coupon usage limit reached", finalPrice: originalPrice };
    }

    // 4. Calculate Discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percent') {
        discountAmount = (originalPrice * coupon.value) / 100;
    } else {
        discountAmount = coupon.value;
    }

    // Ensure price doesn't go below 0
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    // Round to 2 decimal places to be safe
    const roundedPrice = Math.round(finalPrice * 100) / 100;

    return {
        valid: true,
        finalPrice: roundedPrice,
        coupon: coupon as Coupon
    };
}

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
 * @deprecated Use atomic RPC `increment_coupon_usage` or `approve_content_purchase` instead
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

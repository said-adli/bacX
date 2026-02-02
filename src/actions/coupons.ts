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
}

export interface CouponValidationResult {
    valid: boolean;
    discountAmount: number;
    finalPrice: number;
    message?: string;
    coupon?: Coupon;
}

/**
 * Validates a coupon code against an order amount.
 * Checks: Existence, Expiry, Usage Limit, Active Status.
 */
export async function validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResult> {
    const supabase = await createClient(); // Public/Auth client is fine if RLS allows read, but Admin ensures reliability.
    const adminClient = createAdminClient(); // Use Admin to prevent RLS issues if we restrict read later.

    try {
        if (!code) return { valid: false, discountAmount: 0, finalPrice: orderAmount, message: "Code required" };

        const { data: coupon, error } = await adminClient
            .from('coupons')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !coupon) {
            return { valid: false, discountAmount: 0, finalPrice: orderAmount, message: "Invalid code" };
        }

        // 1. Check Active
        if (!coupon.is_active) {
            return { valid: false, discountAmount: 0, finalPrice: orderAmount, message: "Coupon inactive" };
        }

        // 2. Check Expiry
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return { valid: false, discountAmount: 0, finalPrice: orderAmount, message: "Coupon expired" };
        }

        // 3. Check Usage Limit
        if (coupon.used_count >= coupon.max_uses) {
            return { valid: false, discountAmount: 0, finalPrice: orderAmount, message: "Usage limit reached" };
        }

        // 4. Calculate Discount
        let discount = 0;
        if (coupon.discount_type === 'percent') {
            discount = (orderAmount * coupon.value) / 100;
        } else {
            discount = coupon.value;
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, orderAmount);
        const finalPrice = Math.max(0, orderAmount - discount);

        return {
            valid: true,
            discountAmount: discount,
            finalPrice,
            message: "Coupon applied!",
            coupon: coupon as Coupon
        };

    } catch (e) {
        console.error("Validation Error:", e);
        return { valid: false, discountAmount: 0, finalPrice: orderAmount, message: "Validation failed" };
    }
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
            code: data.code?.toUpperCase() // Normalize
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

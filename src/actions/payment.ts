'use server';

import { createClient } from "@/utils/supabase/server";

interface PaymentData {
    userId: string;
    userName: string;
    receiptUrl: string;
    plan: string; // Plan ID
    couponCode?: string;
    amount: string; // Client-reported amount (for verification)
}

export async function submitPayment(data: PaymentData) {
    const supabase = await createClient();

    try {
        // 1. Fetch Plan Details (Source of Truth)
        const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('price, name')
            .eq('id', data.plan)
            .single();

        if (planError || !planData) throw new Error("Invalid Plan");

        let finalAmount = Number(planData.price);

        // 2. Validate Coupon (if provided)
        if (data.couponCode) {
            const { validateCoupon } = await import("@/actions/coupons");
            const couponResult = await validateCoupon(data.couponCode, finalAmount);

            if (!couponResult.valid) {
                // If coupon is invalid but user tried to use it, we should probably fail transaction 
                // OR just ignore coupon? Prompt says "Fetch and validate...". 
                // If invalid, better to reject to avoid user surprise (expecting discount).
                throw new Error(couponResult.message || "Invalid Coupon");
            }
            finalAmount = couponResult.finalPrice;
        }

        // 3. Security Check: Price Tampering
        const clientAmount = Number(data.amount);
        // Allow small epsilon for floating point, though specific amounts should verify exactly.
        if (Math.abs(clientAmount - finalAmount) > 0.5) {
            console.error(`[SECURITY ALERT] Price Tampering Detected. User: ${data.userId}. Plan: ${data.plan}. Client: ${clientAmount}, Server: ${finalAmount}`);
            throw new Error("Price mismatch error. Please refresh and try again.");
        }

        // 4. Insert Payment (Using SERVER Calculated Amount)
        const { data: payment, error } = await supabase
            .from('payments')
            .insert({
                user_id: data.userId, // snake_case mapping
                user_name: data.userName,
                receipt_url: data.receiptUrl,
                amount: finalAmount, // TRUSTED VALUE
                coupon_code: data.couponCode || null, // Record the used coupon
                plan_id: data.plan,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // 5. Update User Profile Status
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'pending'
            })
            .eq('id', data.userId);

        if (profileError) console.error("Profile status update failed", profileError);

        return { success: true, paymentId: payment?.id };
    } catch (error: unknown) {
        console.error("Submit Payment Error:", error);
        throw new Error(error instanceof Error ? error.message : String(error));
    }
}
// Secure Payment Request Creation (CCP Flow)
export async function createPaymentRequest(data: {
    userId: string;
    receiptUrl: string; // The path uploaded by client
    planId?: string;
    contentId?: string;
    contentType?: 'lesson' | 'subject';
    couponCode?: string;
}) {
    const supabase = await createClient();

    try {
        let basePrice = 0;
        let finalAmount = 0;

        // 1. Resolve Price
        if (data.planId) {
            const { data: plan } = await supabase
                .from('subscription_plans')
                .select('price, discount_price')
                .eq('id', data.planId)
                .single();

            if (!plan) throw new Error("Plan not found");
            basePrice = plan.discount_price || plan.price;

        } else if (data.contentId && data.contentType) {
            const table = data.contentType === 'lesson' ? 'lessons' : 'subjects';
            const { data: content } = await supabase
                .from(table)
                .select(data.contentType === 'lesson' ? 'price, is_purchasable' : 'price, is_purchasable') // Unified schema ideally
                // Note: Subject might need different select if schema differs, but assuming somewhat standard
                // If subject table uses 'name' not 'title', select might be just '*' or specific fields.
                // Safest to query generically if we know the schema, but explicit is better.
                // For Subject:
                // .select('price, is_purchasable')
                .eq('id', data.contentId)
                .single();

            if (!content) throw new Error("Content not found");
            // Check purchasable?
            if (!content.is_purchasable) throw new Error("Content not purchasable");

            basePrice = content.price;
        } else {
            throw new Error("Invalid request: No plan or content specified");
        }

        finalAmount = basePrice;

        // 2. Apply Coupon
        if (data.couponCode) {
            // Import dynamically to avoid circle if helper is here (it's in @/actions/coupons)
            const { validateCoupon } = await import("@/actions/coupons");
            const result = await validateCoupon(data.couponCode, basePrice);
            if (result.valid) {
                finalAmount = result.finalPrice;
            } else {
                // If invalid code, we ignore it? or fail?
                // Better to strip it and charge full price? Or fail if user expects discount?
                // Let's strip it but maybe warn? For strictness, if code is sent, we expect it to be valid or we fail.
                // But generally safer to just ignore invalid coupons and charge full price to ensure conversion, 
                // OR fail to avoid "Hey I paid full price but had a coupon!".
                // Let's fail if invalid code presented.
                // throw new Error("Invalid coupon code"); 
                // Actually, client validates UI side. If server fails, it prevents "using expired code".
                // We'll proceed with VALID price. If code invalid, we just don't apply it.
                // Wait, if I submitted with Coupon, I expect discount.
                // If I get charged full, I'm mad.
                // But this is manual review. The Admin sees the amount.
                // We will just record what we calculated.
            }
        }

        // 3. Insert Securely
        // Idempotency: user + content/plan + receipt (approx)
        const idempotencyKey = `${data.userId}-${data.planId || data.contentId}-${data.receiptUrl.split('/').pop()}`;

        const { error } = await supabase.from('payment_requests').upsert({
            user_id: data.userId,
            plan_id: data.planId || null,
            content_id: data.contentId || null,
            content_type: data.contentType || null,
            receipt_url: data.receiptUrl,
            status: 'pending',
            amount: finalAmount, // TRUSTED SERVER CALCULATION
            method: 'ccp',
            coupon_code: data.couponCode || null,
            idempotency_key: idempotencyKey
        }, {
            onConflict: 'idempotency_key',
            ignoreDuplicates: true
        });

        if (error) throw error;

        return { success: true };

    } catch (e: unknown) {
        console.error("Create Payment Request Error:", e);
        return { success: false, error: e instanceof Error ? e.message : "Creation failed" };
    }
}

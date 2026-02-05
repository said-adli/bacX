"use server";

/**
 * Admin Global Actions - Unified RPC Pattern
 * 
 * All admin mutations go through PostgreSQL stored functions
 * with IMMEDIATE revalidateTag calls for instant cache invalidation.
 */

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/cached-data";
import { requireAdmin } from "@/lib/auth-guard";

// ============================================
// TYPES
// ============================================

interface RpcResult<T = string> {
    success: boolean;
    data?: T;
    error?: string;
}

interface RpcError {
    message?: string;
    code?: string;
}

// ============================================
// HELPER: Parse RPC Errors
// ============================================

function parseRpcError(error: RpcError | null): string {
    const message = error?.message || "";

    if (message.includes("Access Denied")) {
        return "ليس لديك صلاحية لهذا الإجراء.";
    }
    if (message.includes("not found")) {
        return "العنصر غير موجود.";
    }
    if (message.includes("required")) {
        return "الحقول المطلوبة ناقصة.";
    }
    if (message.includes("Cannot ban admin")) {
        return "لا يمكن حظر المشرفين.";
    }

    console.error("[RPC Error]", error);
    return "حدث خطأ غير متوقع.";
}

// ============================================
// 1. ANNOUNCEMENTS
// Cache Tag: announcements
// ============================================

export async function createAnnouncementRPC(
    title: string | null,
    content: string,
    isActive: boolean = true
): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_announcement", {
        p_operation: "create",
        p_title: title,
        p_content: content,
        p_is_active: isActive,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    // Instant cache invalidation
    revalidateTag(CACHE_TAGS.ANNOUNCEMENTS, "max");
    revalidatePath("/dashboard");
    revalidatePath("/admin/announcements");

    return { success: true, data: data as string };
}

export async function updateAnnouncementRPC(
    announcementId: string,
    title?: string,
    content?: string,
    isActive?: boolean
): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_announcement", {
        p_operation: "update",
        p_announcement_id: announcementId,
        p_title: title ?? null,
        p_content: content ?? null,
        p_is_active: isActive ?? null,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.ANNOUNCEMENTS, "max");
    revalidatePath("/dashboard");
    revalidatePath("/admin/announcements");

    return { success: true, data: data as string };
}

export async function deleteAnnouncementRPC(announcementId: string): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_announcement", {
        p_operation: "delete",
        p_announcement_id: announcementId,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.ANNOUNCEMENTS, "max");
    revalidatePath("/dashboard");
    revalidatePath("/admin/announcements");

    return { success: true, data: data as string };
}

// ============================================
// 2. PLANS / OFFERS
// Cache Tag: plans
// ============================================

export interface CreatePlanParams {
    name: string;
    price: number;
    discountPrice?: number;
    description?: string;
    features?: string[];
    isActive?: boolean;
    durationDays?: number;
    type?: "subscription" | "course";
}

export async function createPlanRPC(params: CreatePlanParams): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_plan", {
        p_operation: "create",
        p_name: params.name,
        p_price: params.price,
        p_discount_price: params.discountPrice ?? null,
        p_description: params.description ?? null,
        p_features: params.features ? JSON.stringify(params.features) : null,
        p_is_active: params.isActive ?? true,
        p_duration_days: params.durationDays ?? 30,
        p_type: params.type ?? "subscription",
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.PLANS, "max");
    revalidatePath("/admin/offers");
    revalidatePath("/subscription");

    return { success: true, data: data as string };
}

export async function updatePlanRPC(
    planId: string,
    params: Partial<CreatePlanParams>
): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_plan", {
        p_operation: "update",
        p_plan_id: planId,
        p_name: params.name ?? null,
        p_price: params.price ?? null,
        p_discount_price: params.discountPrice ?? null,
        p_description: params.description ?? null,
        p_features: params.features ? JSON.stringify(params.features) : null,
        p_is_active: params.isActive ?? null,
        p_duration_days: params.durationDays ?? null,
        p_type: params.type ?? null,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.PLANS, "max");
    revalidatePath("/admin/offers");
    revalidatePath("/subscription");

    return { success: true, data: data as string };
}

export async function deletePlanRPC(planId: string): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_plan", {
        p_operation: "delete",
        p_plan_id: planId,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.PLANS, "max");
    revalidatePath("/admin/offers");
    revalidatePath("/subscription");

    return { success: true, data: data as string };
}

// ============================================
// 3. USER MANAGEMENT (Ban Hammer)
// Cache Tag: users
// ============================================

export async function banUserRPC(userId: string): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 1. Update profile via RPC
    const { data, error } = await supabase.rpc("manage_user_ban", {
        p_operation: "ban",
        p_user_id: userId,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    // 2. Enforce ban at Auth level (requires admin client)
    try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: "876000h" // ~100 years
        });
        await supabaseAdmin.auth.admin.signOut(userId);
    } catch (authError) {
        console.error("[banUserRPC] Auth enforcement failed:", authError);
        // Profile is already updated, so we continue
    }

    revalidateTag(CACHE_TAGS.USERS, "max");
    revalidatePath("/admin/students");

    return { success: true, data: data as string };
}

export async function unbanUserRPC(userId: string): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // 1. Update profile via RPC
    const { data, error } = await supabase.rpc("manage_user_ban", {
        p_operation: "unban",
        p_user_id: userId,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    // 2. Remove ban at Auth level
    try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: "0"
        });
    } catch (authError) {
        console.error("[unbanUserRPC] Auth enforcement failed:", authError);
    }

    revalidateTag(CACHE_TAGS.USERS, "max");
    revalidatePath("/admin/students");

    return { success: true, data: data as string };
}

// ============================================
// 4. PLATFORM UPDATES (Changelog)
// Cache Tag: platform-updates
// ============================================

export interface CreatePlatformUpdateParams {
    title: string;
    content: string;
    type?: "feature" | "bugfix" | "announcement" | "maintenance";
    isPublished?: boolean;
}

export async function createPlatformUpdateRPC(
    params: CreatePlatformUpdateParams
): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_platform_update", {
        p_operation: "create",
        p_title: params.title,
        p_content: params.content,
        p_type: params.type ?? "feature",
        p_is_published: params.isPublished ?? false,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.PLATFORM_UPDATES, "max");
    revalidatePath("/admin/updates");
    revalidatePath("/changelog");

    return { success: true, data: data as string };
}

export async function updatePlatformUpdateRPC(
    updateId: string,
    params: Partial<CreatePlatformUpdateParams>
): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_platform_update", {
        p_operation: "update",
        p_update_id: updateId,
        p_title: params.title ?? null,
        p_content: params.content ?? null,
        p_type: params.type ?? null,
        p_is_published: params.isPublished ?? null,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.PLATFORM_UPDATES, "max");
    revalidatePath("/admin/updates");
    revalidatePath("/changelog");

    return { success: true, data: data as string };
}

export async function deletePlatformUpdateRPC(updateId: string): Promise<RpcResult> {
    await requireAdmin();
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("manage_platform_update", {
        p_operation: "delete",
        p_update_id: updateId,
    });

    if (error) {
        return { success: false, error: parseRpcError(error) };
    }

    revalidateTag(CACHE_TAGS.PLATFORM_UPDATES, "max");
    revalidatePath("/admin/updates");
    revalidatePath("/changelog");

    return { success: true, data: data as string };
}

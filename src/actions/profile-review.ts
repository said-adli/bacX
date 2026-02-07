"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Admin action to approve a profile change request.
 * Reads the request, updates the profiles table, and marks as approved.
 */
export async function approveProfileChange(requestId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "غير مصرح لك" };
    }

    // Verify admin role
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") {
        return { error: "هذا الإجراء مخصص للمشرفين فقط" };
    }

    // Fetch the change request
    const { data: request, error: fetchError } = await supabase
        .from("profile_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchError || !request) {
        return { error: "طلب التعديل غير موجود" };
    }

    if (request.status !== "pending") {
        return { error: "هذا الطلب تمت معالجته بالفعل" };
    }

    // Update the user's profile with the new data
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            ...request.new_data,
            updated_at: new Date().toISOString()
        })
        .eq("id", request.user_id);

    if (updateError) {
        console.error("Error updating profile:", updateError);
        return { error: "حدث خطأ أثناء تحديث الملف الشخصي" };
    }

    // Mark request as approved
    const { error: approveError } = await supabase
        .from("profile_change_requests")
        .update({
            status: "approved",
            processed_by: user.id,
            processed_at: new Date().toISOString()
        })
        .eq("id", requestId);

    if (approveError) {
        console.error("Error approving request:", approveError);
        return { error: "حدث خطأ أثناء تأكيد الموافقة" };
    }

    revalidatePath("/admin/profile-requests");
    revalidatePath("/profile");

    return { success: "تمت الموافقة على التعديلات بنجاح" };
}

/**
 * Admin action to reject a profile change request.
 */
export async function rejectProfileChange(requestId: string, reason?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "غير مصرح لك" };
    }

    // Verify admin role
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") {
        return { error: "هذا الإجراء مخصص للمشرفين فقط" };
    }

    // Fetch the change request to verify it exists and is pending
    const { data: request, error: fetchError } = await supabase
        .from("profile_change_requests")
        .select("status")
        .eq("id", requestId)
        .single();

    if (fetchError || !request) {
        return { error: "طلب التعديل غير موجود" };
    }

    if (request.status !== "pending") {
        return { error: "هذا الطلب تمت معالجته بالفعل" };
    }

    // Mark request as rejected
    const { error: rejectError } = await supabase
        .from("profile_change_requests")
        .update({
            status: "rejected",
            processed_by: user.id,
            processed_at: new Date().toISOString(),
            rejection_reason: reason || null
        })
        .eq("id", requestId);

    if (rejectError) {
        console.error("Error rejecting request:", rejectError);
        return { error: "حدث خطأ أثناء رفض الطلب" };
    }

    revalidatePath("/admin/profile-requests");

    return { success: "تم رفض الطلب" };
}

/**
 * Admin action to fetch all pending profile change requests.
 */
export async function getPendingProfileRequests() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: [], error: "غير مصرح لك" };
    }

    // Verify admin role
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") {
        return { data: [], error: "هذا الإجراء مخصص للمشرفين فقط" };
    }

    const { data, error } = await supabase
        .from("profile_change_requests")
        .select(`
            *,
            profiles:user_id (
                full_name,
                email,
                avatar_url
            )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching requests:", error);
        return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
}

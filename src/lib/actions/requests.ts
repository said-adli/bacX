"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// Types
export type UpdateProfilePayload = {
    full_name?: string;
    wilaya?: string;
    major?: string;
    study_system?: string;
    bio?: string;
    avatar_url?: string;
    branch_id?: string;
};

export type StudentRequestPayload = UpdateProfilePayload | null;

export interface StudentRequest {
    id: string;
    user_id: string;
    request_type: "UPDATE_PROFILE" | "DELETE_ACCOUNT";
    payload: StudentRequestPayload;
    status: "pending" | "approved" | "rejected";
    admin_note: string | null;
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
        wilaya?: string;
        branch_id?: string;
    };
}

/**
 * Fetch all pending student requests (Admin only)
 */
export async function getStudentRequests(): Promise<{ data: StudentRequest[]; error: string | null }> {
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
        .from("student_requests")
        .select(`
            *,
            profiles:user_id (
                full_name,
                email,
                wilaya,
                branch_id
            )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching student requests:", error);
        return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
}

/**
 * Handle a student request (Approve or Reject)
 * @param requestId - The request ID to process
 * @param decision - 'approve' or 'reject'
 * @param adminNote - Optional rejection reason
 */
export async function handleRequest(
    requestId: string,
    decision: "approve" | "reject",
    adminNote?: string
): Promise<{ success?: string; error?: string }> {
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

    // Fetch the request
    const { data: request, error: fetchError } = await supabase
        .from("student_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchError || !request) {
        return { error: "الطلب غير موجود" };
    }

    if (request.status !== "pending") {
        return { error: "هذا الطلب تمت معالجته بالفعل" };
    }

    // REJECT: Simply update status and save reason
    if (decision === "reject") {
        const { error: rejectError } = await supabase
            .from("student_requests")
            .update({
                status: "rejected",
                admin_note: adminNote || null,
                processed_by: user.id,
                processed_at: new Date().toISOString()
            })
            .eq("id", requestId);

        if (rejectError) {
            console.error("Error rejecting request:", rejectError);
            return { error: "حدث خطأ أثناء رفض الطلب" };
        }

        revalidatePath("/admin/requests");
        return { success: "تم رفض الطلب" };
    }

    // APPROVE: Handle based on request type
    if (decision === "approve") {

        // ========== UPDATE_PROFILE ==========
        if (request.request_type === "UPDATE_PROFILE") {
            if (!request.payload) {
                return { error: "لا توجد بيانات للتحديث" };
            }

            // Update the user's profile with the new data
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    ...request.payload,
                    updated_at: new Date().toISOString()
                })
                .eq("id", request.user_id);

            if (updateError) {
                console.error("Error updating profile:", updateError);
                return { error: "حدث خطأ أثناء تحديث الملف الشخصي" };
            }

            // Mark request as approved
            const { error: approveError } = await supabase
                .from("student_requests")
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

            revalidatePath("/admin/requests");
            revalidatePath("/profile");
            return { success: "تمت الموافقة على تعديل الملف الشخصي" };
        }

        // ========== DELETE_ACCOUNT ==========
        if (request.request_type === "DELETE_ACCOUNT") {
            try {
                // Use Admin Client for hard delete
                const adminClient = createAdminClient();

                // 1. Delete associated data (payments, requests, etc.)
                // CASCADE should handle most, but be explicit for safety
                await adminClient.from("payments").delete().eq("user_id", request.user_id);
                await adminClient.from("student_requests").delete().eq("user_id", request.user_id);

                // 2. Delete Auth User (triggers cascade on profiles)
                const { error: deleteError } = await adminClient.auth.admin.deleteUser(request.user_id);

                if (deleteError) {
                    console.error("Error deleting user:", deleteError);
                    return { error: "حدث خطأ أثناء حذف الحساب" };
                }

                revalidatePath("/admin/requests");
                revalidatePath("/admin/students");
                return { success: "تم حذف الحساب نهائياً" };

            } catch (e) {
                console.error("Hard delete error:", e);
                return { error: "فشل حذف الحساب" };
            }
        }
    }

    return { error: "نوع الإجراء غير معروف" };
}

/**
 * Submit a new student request (for students/users)
 */
export async function submitStudentRequest(
    requestType: "UPDATE_PROFILE" | "DELETE_ACCOUNT",
    payload?: StudentRequestPayload
): Promise<{ success?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "يجب تسجيل الدخول أولاً" };
    }

    // Check for existing pending request of same type
    const { data: existingRequest } = await supabase
        .from("student_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("request_type", requestType)
        .eq("status", "pending")
        .single();

    if (existingRequest) {
        return { error: "لديك طلب قيد المراجعة بالفعل" };
    }

    const { error } = await supabase
        .from("student_requests")
        .insert({
            user_id: user.id,
            request_type: requestType,
            payload: payload || null,
            status: "pending"
        });

    if (error) {
        console.error("Error submitting request:", error);
        return { error: "حدث خطأ أثناء إرسال الطلب" };
    }

    return { success: "تم إرسال الطلب بنجاح" };
}

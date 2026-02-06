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
    origin_table: "profile_change_requests"; // Unified
}

/**
 * Fetch all pending student requests (Admin only)
 * SOURCE: `profile_change_requests` ONLY
 */
export async function getStudentRequests(): Promise<{ data: StudentRequest[]; error: string | null }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [], error: "Unauthorized" };

    // Verify admin
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") return { data: [], error: "Admin only" };

    // Fetch All Pending Requests
    const { data: requests, error } = await supabase
        .from("profile_change_requests")
        .select(`
            id, user_id, new_data, status, rejection_reason, created_at,
            profiles:user_id ( full_name, email, wilaya, branch_id )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching requests:", error);
        return { data: [], error: error.message };
    }

    const mappedRequests: StudentRequest[] = (requests || []).map((req: any) => {
        // Detect Request Type based on payload structure
        const isDeletion = req.new_data?.request_type === "DELETE_ACCOUNT";

        return {
            id: req.id,
            user_id: req.user_id,
            request_type: isDeletion ? "DELETE_ACCOUNT" : "UPDATE_PROFILE",
            payload: req.new_data,
            status: req.status,
            admin_note: req.rejection_reason,
            created_at: req.created_at,
            profiles: Array.isArray(req.profiles) ? req.profiles[0] : req.profiles,
            origin_table: "profile_change_requests"
        };
    });

    return { data: mappedRequests, error: null };
}

export async function handleRequest(
    requestId: string,
    decision: "approve" | "reject",
    adminNote?: string
): Promise<{ success?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Verify admin
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") return { error: "Admin only" };

    // Get Request Data
    const { data: requestData, error: fetchError } = await supabase
        .from("profile_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchError || !requestData) return { error: "Request not found" };

    // === REJECT ===
    if (decision === "reject") {
        const { error } = await supabase.from("profile_change_requests").update({
            status: "rejected",
            rejection_reason: adminNote,
            processed_by: user.id
        }).eq("id", requestId);

        if (error) return { error: error.message };
        revalidatePath("/admin/requests");
        return { success: "Request rejected" };
    }

    // === APPROVE ===
    if (decision === "approve") {
        const isDeletion = requestData.new_data?.request_type === "DELETE_ACCOUNT";

        if (isDeletion) {
            // DELETION LOGIC
            const adminClient = createAdminClient();
            const targetUserId = requestData.user_id;

            // Cleanup related data
            // Note: student_requests table is deprecated, but we might check if it exists or skip
            // We assume standard cleanup:
            await adminClient.from("payments").delete().eq("user_id", targetUserId);
            // Also delete from this table (profile_change_requests) for this user to avoid FK issues if any?
            // Actually CASCADE on user delete should handle it, BUT we need to mark THIS request as approved first?
            // No, if we delete user, this request is deleted.
            // So we must Approve it first? Or just delete?
            // If we delete user, the request disappears. That's fine.

            const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
            if (error) return { error: "Failed to delete user: " + error.message };

            return { success: "User deleted" };
        } else {
            // PROFILE UPDATE LOGIC
            const changes = requestData.new_data;
            const targetUserId = requestData.user_id;

            const { error: updateError } = await supabase.from("profiles").update({
                ...changes,
                updated_at: new Date().toISOString()
            }).eq("id", targetUserId);

            if (updateError) return { error: "Failed to update profile" };

            await supabase.from("profile_change_requests").update({
                status: "approved",
                processed_by: user.id
            }).eq("id", requestId);

            revalidatePath("/admin/requests");
            return { success: "Profile updated" };
        }
    }

    return { error: "Unknown action" };
}

export async function submitStudentRequest(
    requestType: "UPDATE_PROFILE" | "DELETE_ACCOUNT",
    payload?: StudentRequestPayload
): Promise<{ success?: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Unified Submission Logic
    // If Deletion, we wrap it in new_data
    const dataToStore = requestType === "DELETE_ACCOUNT"
        ? { request_type: "DELETE_ACCOUNT", reason: payload } // Payload might be reason string?
        : payload;

    const { error } = await supabase.from("profile_change_requests").insert({
        user_id: user.id,
        new_data: dataToStore || {},
        status: "pending"
    });

    if (error) return { error: error.message };

    return { success: "Request submitted" };
}


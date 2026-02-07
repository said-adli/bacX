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

    // Fetch Requests - Single Source of Truth
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

    interface RequestsRow {
        id: string;
        user_id: string;
        new_data: Record<string, unknown> | null;
        status: "pending" | "approved" | "rejected";
        rejection_reason: string | null;
        created_at: string;
        profiles: {
            full_name: string;
            email: string;
            wilaya?: string;
            branch_id?: string;
        } | {
            full_name: string;
            email: string;
            wilaya?: string;
            branch_id?: string;
        }[] | null;
    }

    const mappedRequests: StudentRequest[] = (requests as unknown as RequestsRow[]).map((req) => {
        // Detect Request Type
        const isDeletion = req.new_data?.request_type === "DELETE_ACCOUNT";

        // Safe Profile Access
        const profileData = req.profiles;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        // Construct Typed Profile
        const safeProfile = profile ? {
            full_name: profile.full_name,
            email: profile.email,
            wilaya: profile.wilaya ?? undefined,
            branch_id: profile.branch_id ?? undefined
        } : undefined;

        // Safe Payload Cast
        const payload = req.new_data as StudentRequestPayload;

        return {
            id: req.id,
            user_id: req.user_id,
            request_type: isDeletion ? "DELETE_ACCOUNT" : "UPDATE_PROFILE",
            payload: payload,
            status: req.status,
            admin_note: req.rejection_reason,
            created_at: req.created_at,
            profiles: safeProfile
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

    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (adminProfile?.role !== "admin") return { error: "Admin only" };

    // 1. Get Request
    const { data: requestData, error: fetchError } = await supabase
        .from("profile_change_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchError || !requestData) return { error: "Request not found" };

    // 2. Reject
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

    // 3. Approve
    if (decision === "approve") {
        const isDeletion = requestData.new_data?.request_type === "DELETE_ACCOUNT";

        if (isDeletion) {
            // DELETION LOGIC
            const adminClient = createAdminClient();
            const targetUserId = requestData.user_id;

            // Purge related data
            // We blindly try to delete from related tables. 
            // If they don't exist, it might throw, but `profile_change_requests` is the master record now.
            await adminClient.from("payments").delete().eq("user_id", targetUserId);

            // Delete User
            const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
            if (error) return { error: "Failed to delete user: " + error.message };

            return { success: "User deleted" };
        } else {
            // PROFILE UPDATE
            const changes = requestData.new_data;
            const targetUserId = requestData.user_id;

            const { error: updateError } = await supabase.from("profiles").update({
                ...changes,
                updated_at: new Date().toISOString()
            }).eq("id", targetUserId);

            if (updateError) return { error: "Failed to update profile" };

            // Mark Approved
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

    // Unified Logic: All requests go to profile_change_requests
    const dataToStore = requestType === "DELETE_ACCOUNT"
        ? { request_type: "DELETE_ACCOUNT", reason: payload }
        : payload;

    const { error } = await supabase.from("profile_change_requests").insert({
        user_id: user.id,
        new_data: dataToStore || {},
        status: "pending"
    });

    if (error) return { error: error.message };

    return { success: "Request submitted" };
}

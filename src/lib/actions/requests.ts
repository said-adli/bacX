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
    // Helper to track origin table
    origin_table: "profile_change_requests" | "student_requests";
}

/**
 * Fetch all pending student requests (Admin only)
 * MERGES: `profile_change_requests` (New) + `student_requests` (Legacy/Deletions)
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

    // 1. Fetch Profile Changes (New Table)
    const { data: profileChanges, error: pcError } = await supabase
        .from("profile_change_requests")
        .select(`
            id, user_id, new_data, status, rejection_reason, created_at,
            profiles:user_id ( full_name, email, wilaya, branch_id )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (pcError) console.error("Error fetching profile changes:", pcError);

    // 2. Fetch Deletion Requests (Legacy Table)
    const { data: deletions, error: delError } = await supabase
        .from("student_requests")
        .select(`
            id, user_id, request_type, payload, status, admin_note, created_at,
            profiles:user_id ( full_name, email, wilaya, branch_id )
        `)
        .eq("status", "pending")
        .eq("request_type", "DELETE_ACCOUNT") // Only deletions
        .order("created_at", { ascending: true });

    if (delError) console.error("Error fetching deletions:", delError);

    const mappedProfileChanges: StudentRequest[] = (profileChanges || []).map((pc: any) => ({
        id: pc.id,
        user_id: pc.user_id,
        request_type: "UPDATE_PROFILE",
        payload: pc.new_data,
        status: pc.status,
        admin_note: pc.rejection_reason,
        created_at: pc.created_at,
        profiles: Array.isArray(pc.profiles) ? pc.profiles[0] : pc.profiles,
        origin_table: "profile_change_requests"
    }));

    const mappedDeletions: StudentRequest[] = (deletions || []).map((d: any) => ({
        id: d.id,
        user_id: d.user_id,
        request_type: d.request_type,
        payload: d.payload,
        status: d.status,
        admin_note: d.admin_note,
        created_at: d.created_at,
        profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
        origin_table: "student_requests"
    }));

    // Merge and Sort
    const allRequests = [...mappedProfileChanges, ...mappedDeletions].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return { data: allRequests, error: null };
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

    // Try to find request in both tables to know where to update
    // OPTIMIZATION: Check profile_change_requests first as it is the priority
    let originTable = "profile_change_requests";
    let requestData: any = null;

    const { data: pcData } = await supabase.from("profile_change_requests").select("*").eq("id", requestId).single();
    if (pcData) {
        requestData = pcData;
        originTable = "profile_change_requests";
    } else {
        const { data: legacyData } = await supabase.from("student_requests").select("*").eq("id", requestId).single();
        if (legacyData) {
            requestData = legacyData;
            originTable = "student_requests";
        }
    }

    if (!requestData) return { error: "Request not found" };

    // === REJECT ===
    if (decision === "reject") {
        if (originTable === "profile_change_requests") {
            const { error } = await supabase.from("profile_change_requests").update({
                status: "rejected",
                rejection_reason: adminNote,
                processed_by: user.id
            }).eq("id", requestId);
            if (error) return { error: error.message };
        } else {
            const { error } = await supabase.from("student_requests").update({
                status: "rejected",
                admin_note: adminNote,
                processed_by: user.id
            }).eq("id", requestId);
            if (error) return { error: error.message };
        }
        revalidatePath("/admin/requests");
        return { success: "Request rejected" };
    }

    // === APPROVE ===
    if (decision === "approve") {
        if (originTable === "profile_change_requests") {
            // Apply Profile Changes
            const changes = requestData.new_data;
            const userId = requestData.user_id;

            const { error: updateError } = await supabase.from("profiles").update({
                ...changes,
                updated_at: new Date().toISOString()
            }).eq("id", userId);

            if (updateError) return { error: "Failed to update profile" };

            await supabase.from("profile_change_requests").update({
                status: "approved",
                processed_by: user.id
            }).eq("id", requestId);

            revalidatePath("/admin/requests");
            return { success: "Profile updated" };
        } else {
            // Legacy / Deletion
            if (requestData.request_type === "DELETE_ACCOUNT") {
                const adminClient = createAdminClient();
                const userId = requestData.user_id;

                await adminClient.from("payments").delete().eq("user_id", userId);
                await adminClient.from("student_requests").delete().eq("user_id", userId);
                await adminClient.from("profile_change_requests").delete().eq("user_id", userId); // Cleanup new table too

                const { error } = await adminClient.auth.admin.deleteUser(userId);
                if (error) return { error: "Failed to delete user" };

                return { success: "User deleted" };
            }
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

    if (requestType === "UPDATE_PROFILE") {
        // New Flow
        const { error } = await supabase.from("profile_change_requests").insert({
            user_id: user.id,
            new_data: payload,
            status: "pending"
        });
        if (error) return { error: error.message };
    } else {
        // Legacy Flow (Deletions)
        const { error } = await supabase.from("student_requests").insert({
            user_id: user.id,
            request_type: requestType,
            payload: payload,
            status: "pending"
        });
        if (error) return { error: error.message };
    }

    return { success: "Request submitted" };
}

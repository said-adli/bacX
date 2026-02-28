"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

// Types
export type UpdateProfilePayload = {
    full_name?: string;
    email?: string;
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
        major?: string;
        study_system?: string;
        bio?: string;
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

    // Fetch Requests - Since no explicit foreign key exists from profile_change_requests -> profiles
    // We will do a generic join or a two-step fetch to avoid PGRST200 relation errors.
    const { data: requests, error } = await supabase
        .from("profile_change_requests")
        .select(`
            id, user_id, new_data, status, rejection_reason, created_at
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching requests:", error);
        return { data: [], error: error.message };
    }

    if (!requests || requests.length === 0) {
        return { data: [], error: null };
    }

    // Step 2: Manually fetch profiles for these requests
    const userIds = requests.map(r => r.user_id);
    const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, wilaya, branch_id, major, study_system, bio")
        .in("id", userIds);

    // Create lookup map
    const profileMap = new Map();
    if (profilesData) {
        profilesData.forEach(p => profileMap.set(p.id, p));
    }

    const mappedRequests: StudentRequest[] = requests.map((req) => {
        // Detect Request Type
        const isDeletion = (req.new_data as Record<string, unknown>)?.request_type === "DELETE_ACCOUNT";

        // Safe Profile Access
        const profile = profileMap.get(req.user_id);

        // Construct Typed Profile
        const safeProfile = profile ? {
            full_name: profile.full_name,
            email: profile.email,
            wilaya: profile.wilaya ?? undefined,
            branch_id: profile.branch_id ?? undefined,
            major: profile.major ?? undefined,
            study_system: profile.study_system ?? undefined,
            bio: profile.bio ?? undefined
        } : undefined;

        // Safe Payload Cast
        const payload = req.new_data as StudentRequestPayload;

        return {
            id: req.id,
            user_id: req.user_id,
            request_type: isDeletion ? "DELETE_ACCOUNT" : "UPDATE_PROFILE",
            payload: payload,
            status: req.status as "pending" | "approved" | "rejected",
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
        const adminClient = createAdminClient();
        const { error } = await adminClient.from("profile_change_requests").update({
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
        const adminClient = createAdminClient();

        if (isDeletion) {
            // DELETION LOGIC
            const targetUserId = requestData.user_id;

            // Purge related data
            await adminClient.from("payments").delete().eq("user_id", targetUserId);

            // Delete User
            const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
            if (error) return { error: "Failed to delete user: " + error.message };

            return { success: "User deleted" };
        } else {
            // PROFILE UPDATE
            const changes = requestData.new_data;
            const targetUserId = requestData.user_id;

            // Strict Error Handling: Update Profile via Admin Client to bypass RLS
            const { error: updateError } = await adminClient.from("profiles").update({
                ...changes,
                updated_at: new Date().toISOString()
            }).eq("id", targetUserId);

            if (updateError) {
                console.error("Profile Update Error (Admin):", updateError);
                return { error: "Failed to update profile: " + updateError.message };
            }

            // Strict Error Handling: Mark Request Approved via Admin Client
            const { error: requestUpdateError } = await adminClient.from("profile_change_requests").update({
                status: "approved",
                processed_by: user.id
            }).eq("id", requestId);

            if (requestUpdateError) {
                console.error("Request Status Update Error:", requestUpdateError);
                return { error: "Profile updated, but failed to mark request as approved." };
            }

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

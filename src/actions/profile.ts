"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface ProfileChangeData {
    full_name?: string;
    wilaya?: string;
    major?: string;
    study_system?: string;
    bio?: string;
    phone_number?: string;
}

/**
 * Submit a profile change request for admin approval.
 * Users cannot update profiles directly - all changes go through the approval queue.
 */
export async function submitProfileChangeRequest(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    // Check if user already has a pending request
    const { data: existingRequest } = await supabase
        .from("profile_change_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

    if (existingRequest) {
        return { error: "لديك طلب تعديل قيد الانتظار بالفعل. يرجى انتظار مراجعة المشرف." };
    }

    // Build the new data object
    const newData: ProfileChangeData = {
        full_name: formData.get("full_name") as string,
        wilaya: formData.get("wilaya") as string,
        major: formData.get("major") as string,
        study_system: formData.get("study_system") as string,
        bio: formData.get("bio") as string,
        phone_number: formData.get("phone") as string,
    };

    // Remove empty/null values
    Object.keys(newData).forEach(key => {
        const k = key as keyof ProfileChangeData;
        if (newData[k] === null || newData[k] === undefined || newData[k] === "") {
            delete newData[k];
        }
    });

    if (Object.keys(newData).length === 0) {
        return { error: "لم يتم تقديم أي تغييرات" };
    }

    // Insert the change request
    const { error } = await supabase
        .from("profile_change_requests")
        .insert({
            user_id: user.id,
            new_data: newData,
            status: "pending"
        });

    if (error) {
        console.error("Profile change request error:", error);
        return { error: "حدث خطأ أثناء إرسال الطلب" };
    }

    revalidatePath("/profile");

    return { success: "تم إرسال طلب التعديل بنجاح. سيتم مراجعته من قبل المشرف." };
}

/**
 * Get the current user's pending profile change request (if any)
 */
export async function getPendingChangeRequest() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Not authenticated" };
    }

    const { data, error } = await supabase
        .from("profile_change_requests")
        .select("id, user_id, new_data, status, created_at")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

    if (error) {
        console.error("Error fetching pending request:", error);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    const full_name = formData.get("full_name") as string;
    const wilaya = formData.get("wilaya") as string;
    const major = formData.get("major") as string;
    const study_system = formData.get("study_system") as string;
    const bio = formData.get("bio") as string;
    const phone = formData.get("phone") as string;

    const updates = {
        full_name,
        wilaya,
        major,
        study_system,
        bio, // Ensure 'bio' exists in your schema or remove if not
        phone_number: phone, // Ensure mapping is correct
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) {
        console.error("Profile update error:", error);
        return { error: "حدث خطأ أثناء حفظ البيانات" };
    }

    revalidatePath("/profile");
    revalidatePath("/settings");
    revalidatePath("/dashboard"); // For header name update

    return { success: "تم حفظ التغييرات بنجاح" };
}

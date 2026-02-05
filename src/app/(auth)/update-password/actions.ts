"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface AuthState { error?: string; success?: string }

export async function updatePasswordAction(prevState: AuthState | null, formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const supabase = await createClient();

    if (password !== confirmPassword) {
        return { error: "كلمات المرور غير متطابقة" };
    }

    if (password.length < 6) {
        return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect("/dashboard");
}

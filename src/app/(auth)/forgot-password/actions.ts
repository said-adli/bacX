"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

interface AuthState { error?: string; success?: string }

export async function forgotPasswordAction(prevState: AuthState | null, formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin");

    if (!email) {
        return { error: "الرجاء إدخال البريد الإلكتروني", success: "" };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
    });

    if (error) {
        return { error: error.message, success: "" };
    }

    return { success: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني", error: "" };
}

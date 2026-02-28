"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface AuthState { error?: string; success?: string }

export async function forgotPasswordAction(prevState: AuthState | null, formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get("origin");

    if (!email) {
        return { error: "الرجاء إدخال البريد الإلكتروني", success: "" };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || origin || '';
    const redirectUrl = `${baseUrl}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
        return { error: error.message, success: "" };
    }

    redirect(`/verify-otp?email=${encodeURIComponent(email)}&type=recovery`);
}

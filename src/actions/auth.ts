'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export interface VerifyOtpState {
    error?: string;
    success?: boolean;
}

export async function verifyOtpAction(prevState: VerifyOtpState | null, formData: FormData): Promise<VerifyOtpState> {
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;
    const type = formData.get("type") as "signup" | "recovery";

    if (!email || !token || !type) {
        return { error: "الرجاء توفير جميع المعلومات المطلوبة" };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
    });

    if (error) {
        return { error: "رمز التحقق غير صحيح أو منتهي الصلاحية" };
    }

    // Redirect based on type
    if (type === "signup") {
        redirect("/dashboard");
    } else if (type === "recovery") {
        redirect("/update-password");
    }

    return { success: true };
}

export async function resendOtpAction(email: string, type: 'signup' | 'recovery') {
    if (!email || !type) {
        return { error: "الرجاء توفير جميع المعلومات المطلوبة" };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resend({
        type: type as any,
        email,
    });

    if (error) {
        return { error: error.message || "حدث خطأ أثناء إعادة إرسال الرمز" };
    }

    return { success: true };
}

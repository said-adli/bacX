"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkRateLimitDistributed, loginRateLimiter } from "@/lib/rate-limit";

interface AuthState { error?: string; success?: string }

export async function loginAction(prevState: AuthState | null, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // --- RATE LIMIT CHECK ---
    const ip = (await headers()).get("x-forwarded-for") || "unknown";
    const { success } = await checkRateLimitDistributed(ip, loginRateLimiter);

    if (!success) {
        return { error: "Too many login attempts. Please try again later." };
    }
    // ------------------------

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Smart Redirect for Unverified Users
        if (error.message.includes("Email not confirmed")) {
            // Step A: Automatically trigger a resend of the OTP
            await supabase.auth.resend({
                type: 'signup',
                email: email
            });
            // Step B: Redirect to verification screen
            redirect(`/verify-otp?email=${encodeURIComponent(email)}&type=signup`);
        }

        // Translate other common errors
        if (error.message.includes("Invalid login credentials")) {
            return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
        }

        return { error: error.message };
    }

    // --- DEVICE CHECK ---
    const deviceId = formData.get("deviceId") as string;
    const userAgent = "Web Client"; // Ideally we get this from headers() if needed

    if (deviceId) {
        const { checkAndRegisterDevice } = await import("@/actions/auth-device");
        const deviceResult = await checkAndRegisterDevice(deviceId, userAgent);

        if (!deviceResult.success) {
            // Rollback Login if device check fails
            await supabase.auth.signOut();
            return { error: deviceResult.error || "Login Failed: Device Limit Reached" };
        }
    }
    // --------------------

    revalidatePath('/', 'layout');
    redirect("/dashboard");
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export interface SignupState {
    error?: string;
    success?: boolean;
}

export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const wilaya = formData.get("wilaya") as string;
    const major = formData.get("major") as string;

    const supabase = await createClient();

    // 1. Sign Up User + Pass Metadata for Trigger
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                wilaya: wilaya,
                major: major,
                role: "student", // Default role
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // 2. Success logic
    // The Client Context will pick up the session change if auto-confirm is on,
    // Or behave accordingly. For now, we return success.

    return { success: true };
}

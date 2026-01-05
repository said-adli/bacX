"use server";

import { createClient } from "@/utils/supabase/server";


export interface SignupState {
    error?: string;
    success?: boolean;
}

export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    // We now receive IDs
    const wilayaId = formData.get("wilaya_id") as string;
    const majorId = formData.get("major_id") as string;

    const supabase = await createClient();

    // 1. Sign Up User + Pass Metadata for Trigger
    // IMPORTANT: The trigger now expects `wilaya_id` and `major_id`
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                wilaya_id: wilayaId,
                major_id: majorId,
                role: "student", // Default role
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // 2. Success logic
    return { success: true };
}

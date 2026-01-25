"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


export interface SignupState {
    error?: string;
    success?: boolean;
}

export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    // Extract all fields from form
    // CRITICAL for Data Save: Capture these fields or they will be NULL
    const wilayaId = formData.get("wilaya_id") as string;
    const majorId = formData.get("major_id") as string;
    const studySystem = formData.get("study_system") as string;
    const phone = formData.get("phone") as string | null;

    const supabase = await createClient();

    // 1. Fetch Labels (Human Readable)
    let wilayaLabel = "";
    let majorLabel = "";

    if (wilayaId) {
        const { data: wilayaData } = await supabase
            .from("wilayas")
            .select("full_label")
            .eq("id", parseInt(wilayaId))
            .single();
        wilayaLabel = wilayaData?.full_label || wilayaId;
    }

    if (majorId) {
        const { data: majorData } = await supabase
            .from("majors")
            .select("label")
            .eq("id", majorId)
            .single();
        majorLabel = majorData?.label || majorId;
    }

    // 2. Sign Up with Metadata
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                wilaya: wilayaLabel,
                wilaya_id: wilayaId,
                major: majorLabel,
                major_id: majorId,
                study_system: studySystem,
                phone: phone || "",
                role: "student",
                is_profile_complete: true,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // 3. MANUAL INSERTION (Anti-Choking Layer)
    // If the database trigger fails or hangs, this ensures the profile exists.
    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            wilaya: wilayaLabel,
            major: majorLabel,
            study_system: studySystem,
            phone_number: phone || "",
            role: 'student',
            is_profile_complete: true,
            updated_at: new Date().toISOString(),
        });

        if (profileError) {
            console.error("CRITICAL: Manual Profile Insert Failed", profileError);
            // We proceed anyway, hoping the trigger worked, but this error log is vital.
        }
    }

    revalidatePath('/', 'layout');
    redirect('/login?message=Account created successfully');
}


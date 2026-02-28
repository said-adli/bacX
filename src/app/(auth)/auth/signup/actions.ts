"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


export interface SignupState {
    error?: string;
    success?: boolean;
    email?: string;
}

export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    // 1. Fetch Labels (Human Readable)
    const wilayaId = formData.get("wilaya_id") as string;
    const majorId = formData.get("major_id") as string;
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

    // 2. Prepare Dynamic Metadata
    const userMetadata: Record<string, any> = {};
    formData.forEach((value, key) => {
        // Exclude sensitive or auth-specific fields
        if (key !== "email" && key !== "password") {
            // Map the frontend `fullName` to standard `full_name` for the trigger
            if (key === "fullName") {
                userMetadata["full_name"] = value;
            } else {
                userMetadata[key] = value;
            }
        }
    });

    // Include the resolved labels and system defaults required to skip onboarding
    userMetadata["wilaya"] = wilayaLabel || userMetadata["wilaya"];
    userMetadata["major"] = majorLabel || userMetadata["major"];
    userMetadata["role"] = "student";
    userMetadata["is_profile_complete"] = true;

    // 3. Sign Up with Dynamic Metadata
    // The Database Trigger will handle inserting into the profiles table.
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: userMetadata,
        },
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');

    // Do NOT redirect on the server. Return success + email so the client can show a toast first.
    return { success: true, email };
}


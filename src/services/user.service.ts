import { createClient } from "@/utils/supabase/server";

export interface UserSettingsDTO {
    emailNotifications: boolean;
}

export interface UserProfileDTO {
    id: string;
    email: string | null;
    fullName: string;
    role: string;
}

/**
 * Service to handle User data fetching and operations.
 * Isolates DB logic from UI components.
 */
export async function getUserSettings(userId: string): Promise<UserSettingsDTO> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("email_notifications")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("User Service Error [getUserSettings]:", error);
        // Default to true if fetch fails to avoid blocking UI
        return { emailNotifications: true };
    }

    return {
        emailNotifications: data?.email_notifications ?? true
    };
}

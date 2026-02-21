import { createClient } from "@/utils/supabase/server";
import { UserProfile } from "@/context/AuthContext";

export interface DashboardData {
    announcement: {
        content: string;
        createdAt: Date;
    } | null;
    userProfile: UserProfile | null;
}

/**
 * Fetches initial data for the dashboard on the server.
 * Uses Supabase Client for Server Components.
 */
export async function getDashboardData(uid: string): Promise<DashboardData> {
    const supabase = await createClient();

    // Parallelize fetches
    const [announcementRes, profileRes] = await Promise.all([
        supabase
            .from("announcements")
            .select("content, created_at")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),

        supabase
            .from("profiles")
            .select(`
                *,
                wilayas ( full_label ),
                majors ( label )
            `)
            .eq("id", uid)
            .single()
    ]);

    // Process Announcement
    let announcement = null;
    if (announcementRes.data) {
        announcement = {
            content: announcementRes.data.content,
            createdAt: new Date(announcementRes.data.created_at),
        };
    }

    // Process Profile
    let userProfile: UserProfile | null = null;
    if (profileRes.data) {
        const raw = profileRes.data;
        // Map Relational Data to flat strings for UserProfile compatibility
        userProfile = {
            ...raw,
            wilaya: raw.wilayas?.full_label, // Flatten relation
            major: raw.majors?.label,        // Flatten relation
            // Ensure types match UserProfile interface
            created_at: raw.created_at,
            // Strip the relation objects if not needed in the type, but JS will keep them. 
            // We just ensure 'wilaya' and 'major' properties exist.
        } as unknown as UserProfile;
    }

    return {
        announcement,
        userProfile,
    };
}

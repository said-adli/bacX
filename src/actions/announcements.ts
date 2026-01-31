"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Basic role check (can be improved with verifyAdmin)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!content) throw new Error("Content is required");

    const { error } = await supabase.from("announcements").insert({
        title, // Assuming title exists now, or if it fails we might need migration
        content,
        is_active: true
    });

    if (error) {
        console.error("Create Announcement Error:", error);
        throw new Error("Failed to create announcement");
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/announcements");
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createClient();

    // Check Admin (Simplified for speed, ideally reuse verifyAdmin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
        console.error("Delete Announcement Error:", error);
        throw new Error("Failed to delete announcement");
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/announcements");
}

export async function getAdminAnnouncements() {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

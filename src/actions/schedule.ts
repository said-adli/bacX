"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const event_date = formData.get("event_date") as string;
    const type = formData.get("type") as string;

    if (!title || !event_date || !type) throw new Error("Title, Event Date, and Type are required");

    const { error } = await supabase.from("schedules").insert({
        title,
        description,
        event_date,
        type
    });

    if (error) {
        console.error("Create Schedule Error:", error);
        throw new Error("Failed to create schedule");
    }

    revalidatePath('/admin/schedule');
    revalidatePath('/dashboard');
}

export async function deleteSchedule(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("schedules").delete().eq("id", id);

    if (error) {
        console.error("Delete Schedule Error:", error);
        throw new Error("Failed to delete schedule");
    }

    revalidatePath('/admin/schedule');
    revalidatePath('/dashboard');
}

export async function getAdminSchedules() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("event_date", { ascending: true });

    if (error) throw error;
    return data || [];
}

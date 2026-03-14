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
    const event_date_raw = formData.get("event_date") as string;
    const type = formData.get("type") as string;

    if (!title || !event_date_raw || !type) throw new Error("Title, Event Date, and Type are required");

    // datetime-local gives 'YYYY-MM-DDTHH:mm' — treat as local time and attach offset
    const parsedDate = new Date(event_date_raw);
    if (isNaN(parsedDate.getTime())) throw new Error("Invalid event date format");
    const tzOffset = -parsedDate.getTimezoneOffset();
    const sign = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
    const event_date = `${event_date_raw}:00${sign}${pad(Math.floor(Math.abs(tzOffset) / 60))}:${pad(Math.abs(tzOffset) % 60)}`;

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
        .select("id, title, description, event_date, type, created_at")
        .order("event_date", { ascending: true });

    if (error) throw error;
    return data || [];
}

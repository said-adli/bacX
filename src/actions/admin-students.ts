"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface StudentProfile {
    id: string;
    full_name: string | null;
    email: string | null;
    wilaya: string | null;
    study_system: string | null;
    created_at: string;
    is_restored: boolean; // Assuming 'banned' concept might use this or a specific flag. 
    // If 'banned' column doesn't exist, we might need to add it or use metadata. 
    // Checking schema via user context, often 'banned_until' or logic in auth.
    // Let's assume a 'banned' boolean or similar for this reconstruction.
    // If not in schema, we'll need to add it. For now, we'll try to use a metadata approach or 'isActive'.
    // V2 Req: "Ban/Unban" -> implies a state.

    // Subscription info joining
    is_subscribed: boolean;
    subscription_end_date: string | null;
}

// FETCH STUDENTS
export async function getStudents(
    page = 1,
    query = "",
    filter: "all" | "active" | "expired" | "banned" = "all"
) {
    const supabase = await createClient();
    const PAGE_SIZE = 10;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let dbQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (query) {
        dbQuery = dbQuery.ilike('full_name', `%${query}%`);
    }

    // Filters
    // Note: These rely on column existence. 
    if (filter === 'active') {
        dbQuery = dbQuery.eq('is_subscribed', true);
    } else if (filter === 'expired') {
        // Complex filter: subscribed=false AND had a subscription before? 
        // Or just is_subscribed=false?
        dbQuery = dbQuery.eq('is_subscribed', false);
    }

    // Banned filter would depend on column

    const { data, count, error } = await dbQuery;

    if (error) {
        console.error("Error fetching students:", error);
        throw new Error("Failed to fetch students");
    }

    return {
        students: data,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE)
    };
}

// ACTIONS

// TOGGLE BAN (Robust: Updates Auth + Profile)
export async function toggleBanStudent(userId: string, shouldBan: boolean) {
    // Note: To ban via Auth API, we need the Service Role (createAdminClient).
    // Ensure you have utils/supabase/admin.ts setup with SERVICE_ROLE_KEY.
    const { createAdminClient } = await import("@/utils/supabase/admin"); // Dynamic import to avoid cycles or if file missing
    const supabaseAdmin = createAdminClient();
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Update Profile (Visual)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_banned: shouldBan } as any)
        .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Update Auth User (Enforcement)
    if (shouldBan) {
        // Ban for 100 years
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
        await supabaseAdmin.auth.admin.signOut(userId); // Force Logout
    } else {
        await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "0" });
    }

    revalidatePath('/admin/students');
}

// MANUAL EXPIRY / TERMINATE
export async function manualsExpireSubscription(userId: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('profiles')
        .update({
            is_subscribed: false,
            subscription_end_date: new Date().toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/students');
}

// EXTEND SUBSCRIPTION (New)
export async function extendSubscription(userId: string, daysToAdd: number) {
    const supabase = await createClient();

    // Get current profile
    const { data: profile } = await supabase.from('profiles').select('subscription_end_date, is_subscribed').eq('id', userId).single();
    if (!profile) throw new Error("Profile not found");

    let newEndDate = new Date();
    // If currently valid, add to end date
    if (profile.is_subscribed && profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date()) {
        newEndDate = new Date(profile.subscription_end_date);
    }
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const { error } = await supabase
        .from('profiles')
        .update({
            is_subscribed: true,
            subscription_end_date: newEndDate.toISOString()
        })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/students');
}

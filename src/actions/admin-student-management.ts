'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// TYPES
export interface AdminStudentProp {
    id: string;
    full_name: string;
    email: string | null;
    wilaya: string;
    branch: string;
    study_system: string;
    role: string;
    is_subscribed: boolean;
    subscription_end: string | null;
    banned: boolean;
    created_at: string;
    last_sign_in_at?: string;
    days_remaining: number;
}

// FETCHERS
export async function getAllStudents(query: string = "") {
    const adminClient = createAdminClient();

    // 1. Fetch Profiles
    let profileQuery = adminClient
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

    if (query) {
        profileQuery = profileQuery.ilike('full_name', `%${query}%`);
    }

    const { data: profiles, error } = await profileQuery;

    if (error) {
        console.error("Error fetching profiles:", error);
        throw new Error("Failed to fetch students");
    }

    // 2. Fetch Auth Users (to get Emails)
    // List users is paginated, but for now we might list a chunk or attempt to map.
    // Ideally we sync email to profile, but here we'll try to map efficiently.
    // If the list is huge, this is slow. For V9.1 Surgical Control, we might just fetch 50/100.
    // NOTE: Supabase Admin listUsers doesn't support 'IN' filter on ID easily without looping.
    // OPTIMIZATION: We will fetch ALL users for now (Mega Structure V9.0 assumption: manageable size or migrated to synced email).
    const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (authError) console.error("Error fetching auth users:", authError);

    // 3. Map & Merge
    const students: AdminStudentProp[] = profiles.map(profile => {
        const authUser = users?.find(u => u.id === profile.id);

        // Calculate Days Remaining
        let days_remaining = 0;
        if (profile.is_subscribed && profile.subscription_end) {
            const end = new Date(profile.subscription_end);
            const now = new Date();
            const diffTime = end.getTime() - now.getTime();
            days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (days_remaining < 0) days_remaining = 0;
        }

        return {
            ...profile,
            email: authUser?.email || profile.email || "No Email", // Fallback if profile has email
            last_sign_in_at: authUser?.last_sign_in_at || profile.last_sign_in_at,
            days_remaining
        };
    });

    return students;
}

// ACTIONS

export async function updateStudentProfile(id: string, data: { full_name?: string; wilaya?: string }) {
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from('profiles')
        .update(data)
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/students');
    return { success: true };
}

export async function extendSubscription(id: string, daysToAdd: number) {
    const adminClient = createAdminClient();

    // 1. Get current subscription end
    const { data: profile } = await adminClient.from('profiles').select('subscription_end, is_subscribed').eq('id', id).single();

    if (!profile) throw new Error("Profile not found");

    let newEndDate = new Date();
    // If currently subscribed and not expired, add to existing end date
    if (profile.is_subscribed && profile.subscription_end && new Date(profile.subscription_end) > new Date()) {
        newEndDate = new Date(profile.subscription_end);
    }

    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    // 2. Update
    const { error } = await adminClient
        .from('profiles')
        .update({
            is_subscribed: true,
            subscription_end: newEndDate.toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/students');
    return { success: true, newDate: newEndDate.toISOString() };
}

export async function toggleStudentBan(id: string, currentStatus: boolean) {
    const adminClient = createAdminClient();
    const { error } = await adminClient
        .from('profiles')
        .update({ banned: !currentStatus })
        .eq('id', id);

    if (error) throw error;

    // If banning, maybe force logout?
    if (!currentStatus) {
        await adminClient.auth.admin.signOut(id); // Supabase Admin SignOut (invalidates sessions)
    }

    revalidatePath('/admin/students');
    return { success: true };
}

export async function logoutStudent(id: string) {
    const adminClient = createAdminClient();
    // Invalidate all tokens
    const { error } = await adminClient.auth.admin.signOut(id);
    if (error) throw error;

    // Optional: Clear active devices in profile if we use that for tracking
    // await adminClient.from('profiles').update({ active_devices: [] }).eq('id', id);

    revalidatePath('/admin/students');
    return { success: true };
}

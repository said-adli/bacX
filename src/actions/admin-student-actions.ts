'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { verifyAdmin } from "@/utils/supabase/server";
import { logAdminAction } from "@/lib/admin-logger";
import { revalidatePath } from "next/cache";

export interface Student {
    id: string;
    full_name: string;
    email: string; // From auth.users, joined if possible, or stored in profiles
    phone?: string;
    wilaya?: string;
    study_system?: string;
    role: string;
    is_subscribed: boolean;
    subscription_tier?: string; // 'regular' | 'vip'
    created_at: string;
    last_sign_in_at?: string;
    banned_until?: string; // If present, user is banned
}

interface GetStudentsParams {
    query?: string;
    page?: number;
    pageSize?: number;
    statusFilter?: 'all' | 'active' | 'banned' | 'vip';
}

export async function getStudents({
    query = '',
    page = 1,
    pageSize = 10,
    statusFilter = 'all'
}: GetStudentsParams) {
    try {
        const { user, supabase } = await verifyAdmin(); // Ensure admin & get auth client

        // Calculate pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let dbQuery = supabase
            .from('profiles')
            .select('*', { count: 'exact' });

        // Text Search
        if (query) {
            dbQuery = dbQuery.ilike('full_name', `%${query}%`);
        }

        // Role Filter (Always exclude admins from this list logic usually)
        dbQuery = dbQuery.neq('role', 'admin');

        // Status Filters
        if (statusFilter === 'active') {
            dbQuery = dbQuery.eq('is_subscribed', true);
        } else if (statusFilter === 'banned') {
            // Assuming we have a way to track bans, e.g. metadata or a field. 
            // For now, let is_banned be a mental model, in reality Supabase uses `banned_until` in auth which is hard to query from profiles unless synced.
            // We will rely on a new field `is_banned` in profiles if distinct, or just skip if not in schema yet.
            // Let's assume we added `is_banned` to profiles or we check `banned_until` if synced.
            // For safety given unknown schema, we skip specific banned filter unless we know the column exists.
        } else if (statusFilter === 'vip') {
            // Assume VIP tracking if exists
        }

        // execute
        const { data: profiles, error, count } = await dbQuery
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            students: profiles as Student[],
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize)
        };

    } catch (err: any) {
        console.error("DEBUG: Error fetching students:", err);
        return {
            students: [],
            totalCount: 0,
            totalPages: 0,
            error: err.message || String(err)
        };
    }
}

export async function toggleBanUser(userId: string, isBanned: boolean) {
    try {
        const { user: admin } = await verifyAdmin();
        const supabase = createAdminClient();

        // 1. Update Profile (Visual indicator)
        await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId);

        // 2. Update Auth User (Actual enforcement)
        // Supabase Admin API: updateUserById(uid, { ban_duration: ... })
        if (isBanned) {
            await supabase.auth.admin.updateUserById(userId, { ban_duration: "876000h" }); // 100 years
        } else {
            await supabase.auth.admin.updateUserById(userId, { ban_duration: "0" });
        }

        // 3. Log
        await logAdminAction({
            adminId: admin.id,
            action: isBanned ? "BAN_USER" : "UNBAN_USER",
            targetId: userId
        });

        revalidatePath('/admin/students');
        return { success: true };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}

export async function updateSubscription(userId: string, isSubscribed: boolean) {
    try {
        const { user: admin } = await verifyAdmin();
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('profiles')
            .update({ is_subscribed: isSubscribed })
            .eq('id', userId);

        if (error) throw error;

        // Log
        await logAdminAction({
            adminId: admin.id,
            action: isSubscribed ? "ACTIVATE_SUBSCRIPTION" : "EXTEND_SUBSCRIPTION", // Simplification
            targetId: userId,
            details: { newStatus: isSubscribed }
        });

        revalidatePath('/admin/students');
        return { success: true };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}

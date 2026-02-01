"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export interface LogEntry {
    id: string;
    user_id: string;
    event: string;
    details: any;
    ip_address: string;
    created_at: string;
    profiles?: {
        full_name: string | null;
        email: string | null;
        role: string;
    };
}

export async function getSecurityLogs(
    page = 1,
    filter: 'all' | 'admin_only' | 'system' = 'all'
) {
    const supabaseAdmin = createAdminClient();
    const PAGE_SIZE = 20;

    let query = supabaseAdmin
        .from('security_logs')
        .select(`
            *,
            profiles:user_id (
                full_name,
                email,
                role
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, ((page - 1) * PAGE_SIZE) + (PAGE_SIZE - 1));

    // Filter Logic (Simple for now)
    if (filter === 'admin_only') {
        // This is imperfect without joining on role, but filtering by event names is faster
        query = query.ilike('event', '%ADMIN%');
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching logs:", error);
        return { logs: [], total: 0, totalPages: 0 };
    }

    return {
        logs: data as LogEntry[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE)
    };
}

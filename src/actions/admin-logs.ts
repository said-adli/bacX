"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";

export interface SecurityProfile {
    full_name: string | null;
    email: string | null;
    role: string;
}

export interface LogEntry {
    id: string;
    user_id: string | null; // Nullable if ON DELETE SET NULL
    event: string;
    details: Record<string, any> | null; // Structured JSON or null
    ip_address: string;
    created_at: string;
    profiles?: SecurityProfile;
}

export interface LogsResponse {
    logs: LogEntry[];
    total: number;
    totalPages: number;
}

export async function getSecurityLogs(
    page = 1,
    filter: 'all' | 'admin_only' | 'system' = 'all'
): Promise<LogsResponse> {
    await requireAdmin();
    const supabaseAdmin = createAdminClient();
    const PAGE_SIZE = 20;

    let query = supabaseAdmin
        .from('security_logs')
        .select(`
            id,
            user_id,
            event,
            details,
            ip_address,
            created_at,
            profiles:user_id (
                full_name,
                email,
                role
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, ((page - 1) * PAGE_SIZE) + (PAGE_SIZE - 1));

    // Filter Logic
    if (filter === 'admin_only') {
        query = query.ilike('event', '%ADMIN%');
    }

    const { data, count, error } = await query;

    if (error) {
        console.error("Error fetching logs:", error);
        return { logs: [], total: 0, totalPages: 0 };
    }

    // Strict Type Mapping
    const logs: LogEntry[] = (data || []).map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        event: log.event,
        details: log.details,
        ip_address: log.ip_address,
        created_at: log.created_at,
        profiles: log.profiles ? {
            full_name: log.profiles.full_name,
            email: log.profiles.email,
            role: log.profiles.role
        } : undefined
    }));

    return {
        logs,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE)
    };
}

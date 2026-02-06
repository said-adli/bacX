"use server";

import { createClient } from "@/utils/supabase/server";

export async function exportLogsAsCSV() {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Forbidden");

    // Fetch Logs
    const { data: logs, error } = await supabase
        .from('security_logs')
        .select(`
            created_at,
            event,
            ip_address,
            details,
            profiles (email, full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(5000);

    if (error) throw new Error(error.message);

    // Flatten
    interface Profile {
        email: string | null;
        full_name: string | null;
        role: string | null;
    }

    interface LogEntry {
        created_at: string;
        event: string;
        ip_address: string | null;
        details: unknown;
        profiles: Profile | Profile[] | null;
    }

    interface ExportData {
        timestamp: string;
        event: string;
        ip_address: string | null;
        user_email: string;
        user_name: string;
        user_role: string;
        details: string;
    }

    // Safe access to profiles which might be returned as array or object depending on Supabase inference
    const flattenedLogs: ExportData[] = (logs as unknown as LogEntry[]).map((log) => {
        const profileData = log.profiles;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        return {
            timestamp: log.created_at,
            event: log.event,
            ip_address: log.ip_address,
            user_email: profile?.email || 'N/A',
            user_name: profile?.full_name || 'N/A',
            user_role: profile?.role || 'N/A',
            details: JSON.stringify(log.details).replace(/"/g, '""') // Escape quotes
        };
    });

    if (flattenedLogs.length === 0) {
        return "";
    }

    try {
        // Manual CSV Generation (Zero Dependency)
        const headers: (keyof ExportData)[] = ["timestamp", "event", "ip_address", "user_email", "user_name", "user_role", "details"];
        const csvRows = [headers.join(",")];

        for (const row of flattenedLogs) {
            const values = headers.map(header => {
                const val = row[header] ?? "";
                return `"${val}"`; // Wrap in quotes
            });
            csvRows.push(values.join(","));
        }

        return csvRows.join("\n");
    } catch (err) {
        console.error("CSV Gen Error", err);
        throw new Error("Failed to generate CSV");
    }
}

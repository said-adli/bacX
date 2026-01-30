'use server';

import { createClient, verifyAdmin } from "@/utils/supabase/server";
// Use dynamic import for admin client to avoid edge-runtime issues if needed, or keeping it as is if environment supports it.
import { createAdminClient } from "@/utils/supabase/admin";

export interface DashboardStats {
    totalStudents: number;
    regularStudents: number;
    vipStudents: number;
    totalRevenue: number;
    activeOnline: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const adminClient = createAdminClient();

        // 1. Total Students & VIPs
        const { count: totalStudents } = await adminClient
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student');

        const { count: vipStudents } = await adminClient
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_subscribed', true);

        const regularStudents = (totalStudents || 0) - (vipStudents || 0);

        // 2. Active Online (Last 15 Minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { data: logs } = await adminClient
            .from('security_logs')
            .select('user_id')
            .gte('created_at', fifteenMinutesAgo);

        // Count unique user_ids
        const uniqueActiveUsers = new Set(logs?.map(l => l.user_id)).size;

        // 3. Total Revenue
        const { data: payments } = await adminClient
            .from('payments')
            .select('amount')
            .eq('status', 'succeeded'); // Valid status check

        let totalRevenue = 0;
        if (payments) {
            payments.forEach(p => {
                // Ensure amount is treated as string for replacement, then parsed
                const amountStr = String(p.amount);
                const val = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(val)) totalRevenue += val;
            });
        }

        return {
            totalStudents: totalStudents || 0,
            regularStudents: regularStudents || 0,
            vipStudents: vipStudents || 0,
            totalRevenue,
            activeOnline: uniqueActiveUsers
        };

    } catch (err: any) {
        console.error("CRITICAL ADMIN STATS ERROR:", err);
        return {
            totalStudents: 0,
            regularStudents: 0,
            vipStudents: 0,
            totalRevenue: 0,
            activeOnline: 0
        };
    }
}

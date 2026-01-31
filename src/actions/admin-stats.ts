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

        const [
            allMapResult,
            activeResult,
            paymentsResult
        ] = await Promise.all([
            // 1. Fetch Student Counts (Regular & VIP)
            // We can do two count queries in parallel or one generic one. 
            // For max speed, separate exact counts might be faster or slower depending on index.
            // Let's optimize by running them in parallel.
            Promise.all([
                adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_subscribed', true)
            ]),

            // 2. Active Online
            (async () => {
                const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
                const { data: logs } = await adminClient
                    .from('security_logs')
                    .select('user_id')
                    .gte('created_at', fifteenMinutesAgo);
                return logs ? new Set(logs.map(l => l.user_id)).size : 0;
            })(),

            // 3. Revenue
            adminClient.from('payments').select('amount').eq('status', 'succeeded')
        ]);

        const totalStudents = allMapResult[0].count || 0;
        const vipStudents = allMapResult[1].count || 0;
        const regularStudents = totalStudents - vipStudents;
        const activeOnline = activeResult;

        // Calculate Revenue
        let totalRevenue = 0;
        if (paymentsResult.data) {
            paymentsResult.data.forEach(p => {
                const amountStr = String(p.amount);
                const val = parseFloat(amountStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(val)) totalRevenue += val;
            });
        }

        return {
            totalStudents,
            regularStudents,
            vipStudents,
            totalRevenue,
            activeOnline
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

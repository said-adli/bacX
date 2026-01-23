'use server';

import { createClient, verifyAdmin } from "@/utils/supabase/server";
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
        const supabase = await createClient();
        const adminClient = createAdminClient();

        await verifyAdmin();

        // 1. Total Students
        const { count: totalStudents } = await adminClient
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student');

        // 2. VIP Students (Subscribed)
        const { count: vipStudents } = await adminClient
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_subscribed', true);

        const regularStudents = (totalStudents || 0) - (vipStudents || 0);

        // 3. Active Online (From security_logs past 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        // Note: Supabase doesn't support SELECT DISTINCT in simple client calls easily.
        // We will fetch logs and unique them in JS for now or use a dedicated RPC if performance demands.
        // For V1 (Small Scale), fetching logs is acceptable.
        // Optimization: Use head=false and check user_id.
        const { data: logs } = await adminClient
            .from('security_logs') // or 'auth_logs' depending on system
            .select('user_id')
            .gte('created_at', oneDayAgo);

        const activeOnline = logs ? new Set(logs.map(l => l.user_id)).size : 0;


        // 4. Total Revenue
        // Assuming 'payments' table exists and has 'amount' and 'status'
        const { data: payments } = await adminClient
            .from('payments')
            .select('amount')
            .eq('status', 'approved');

        let totalRevenue = 0;
        if (payments) {
            payments.forEach(p => {
                // handle if amount is number or string "2500 DA"
                const val = typeof p.amount === 'string'
                    ? parseFloat(p.amount.replace(/[^0-9.]/g, ''))
                    : Number(p.amount);
                if (!isNaN(val)) totalRevenue += val;
            });
        }

        return {
            totalStudents: totalStudents || 0,
            regularStudents: regularStudents || 0,
            vipStudents: vipStudents || 0,
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

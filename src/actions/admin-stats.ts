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

export interface RevenueData {
    name: string;
    revenue: number;
}

export async function getRevenueStats(): Promise<RevenueData[]> {
    try {
        const adminClient = createAdminClient();

        // Fetch last 12 months of successful payments
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const { data: payments } = await adminClient
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'succeeded')
            .gte('created_at', oneYearAgo.toISOString())
            .order('created_at', { ascending: true });

        if (!payments) return [];

        // Aggregate by Month
        const monthlyRevenue: { [key: string]: number } = {};

        payments.forEach(p => {
            const date = new Date(p.created_at);
            const monthKey = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb"

            const amountStr = String(p.amount);
            const val = parseFloat(amountStr.replace(/[^0-9.]/g, ''));

            if (!isNaN(val)) {
                monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + val;
            }
        });

        // Ensure chronological order (simple approach: mapped from date objects)
        // Or simpler: Just map the result to the interface format. 
        // Note: The simple aggregation above loses sorting if we iterate object keys. 
        // Better: Iterate last 6-7 months and fill gaps.

        const result: RevenueData[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('en-US', { month: 'short' });

            result.push({
                name: monthName,
                revenue: monthlyRevenue[monthName] || 0
            });
        }

        return result;

    } catch (e) {
        console.error("Revenue Stats Error:", e);
        return [];
    }
}


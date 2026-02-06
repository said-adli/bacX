import { createClient } from "@/utils/supabase/server";
import FinancialPageClient from "@/components/admin/dashboard/FinancialPageClient";

export const dynamic = "force-dynamic";

export default async function FinancialDashboardPage() {
    const supabase = await createClient();

    // Fetch from 'analytics_revenue' view
    const { data, error } = await supabase
        .from("analytics_revenue")
        .select("*")
        .single();

    if (error || !data) {
        console.error("Analytics fetch failed", error);
        return <div className="p-10 text-red-500">Analytics Unavailable (SQL View Missing)</div>;
    }

    const financialData = {
        totalRevenue: data.total_revenue || 0,
        totalTransactions: data.total_transactions || 0,
        monthlyRevenue: data.monthly_revenue as Record<string, number> || {},
        planStats: data.plan_stats as Record<string, number> || {}
    };

    return <FinancialPageClient data={financialData} />;
}

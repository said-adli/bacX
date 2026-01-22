import { createClient } from "@/utils/supabase/server";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { ActivityChart } from "../../components/admin/dashboard/ActivityChart";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Fetch Key Metrics
    // Note: specific queries will depend on actual DB volume. 
    // For V1 reconstruction, we do simple counts.

    // Total Students
    const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

    // Active Subscriptions
    // Assuming subscription_plans relation or is_subscribed flag in profiles (based on user context previously)
    // Let's use the profiles.is_subscribed flag for speed if available, or query subscriptions table
    const { count: activeSubscriptions } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_subscribed', true);

    // Total Revenue (Mock calculation for now as we don't have a payments table full history in context yet)
    // detailed fetching would go here.
    const totalRevenue = 1542000; // Mocked for initial view

    // Active Sessions (Mocked/Real-time need presence, we use a placeholder or log table count)
    const activeSessions = 42;

    return (
        <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard Overview</h2>
            <p className="text-zinc-500 mb-8">Welcome back, Admin. Here is what is happening today.</p>

            {/* Top Stats */}
            <StatsGrid
                totalStudents={totalStudents || 0}
                activeSubscriptions={activeSubscriptions || 0}
                totalRevenue={totalRevenue}
                activeSessions={activeSessions}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 h-[400px]">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1 h-[400px]">
                    <ActivityChart />
                </div>
            </div>

            {/* Recent Activity / Quick Actions could go here */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-white">System Status: HEALTHY</h3>
                    <p className="text-blue-200/60 text-sm">All systems operational. Next backup scheduled in 2h.</p>
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    Run Diagnostics
                </button>
            </div>
        </div>
    );
}

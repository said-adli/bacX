import { createClient } from "@/utils/supabase/server";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { ActivityChart } from "../../components/admin/dashboard/ActivityChart";
import { getDashboardStats } from "@/actions/admin-stats";

export const metadata = {
    title: "Command Center",
};

export default async function AdminDashboard() {
    // Fetch Real Stats (Data Binding Overhaul)
    const stats = await getDashboardStats();

    return (
        <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard Overview</h2>
            <p className="text-zinc-500 mb-8">Welcome back, Admin. Here is what is happening today.</p>

            {/* Top Stats */}
            <StatsGrid
                totalStudents={stats.totalStudents}
                activeSubscriptions={stats.vipStudents}
                totalRevenue={stats.totalRevenue}
                activeSessions={stats.activeOnline}
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
            {/* Dashboard Footer / Space */}
            <div className="h-4" />
        </div>
    );
}

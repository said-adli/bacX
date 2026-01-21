import { getDashboardStats } from "@/actions/admin-stats";
import { RevenueChart, ActivityHeatmap } from "@/components/admin/dashboard/DashboardCharts";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Users, CreditCard, ShieldCheck, GraduationCap } from "lucide-react";

export const metadata = {
    title: "Admin - Control Center",
};

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    // Helper for KPI Card
    const KpiCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
        <AdminGlassCard className="relative overflow-hidden">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${color} opacity-20 blur-xl`}></div>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
                    {subtitle && <p className="mt-1 text-xs text-blue-400">{subtitle}</p>}
                </div>
                <div className={`rounded-xl ${color} bg-opacity-10 p-3 text-white`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </AdminGlassCard>
    );

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white">
                    Mega Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Center</span>
                </h1>
                <p className="text-gray-400">Live system overview</p>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    color="bg-blue-500"
                    subtitle={`${stats.regularStudents} Free / ${stats.vipStudents} VIP`}
                />
                <KpiCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <KpiCard
                    title="Active VIPs"
                    value={stats.vipStudents}
                    icon={GraduationCap}
                    color="bg-purple-500"
                />
                <KpiCard
                    title="System Health"
                    value="99.9%"
                    icon={ShieldCheck}
                    color="bg-emerald-500"
                    subtitle="All systems operational"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RevenueChart total={stats.totalRevenue} />
                </div>
                <div>
                    <ActivityHeatmap active={stats.activeOnline} />
                </div>
            </div>
        </div>
    );
}

// Icon helper
function DollarSign(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

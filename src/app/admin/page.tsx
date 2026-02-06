import { Suspense } from "react";
import { AdminStatsWrapper } from "@/components/admin/dashboard/AdminStatsWrapper";
import { AdminStatsSkeleton } from "@/components/skeletons/AdminStatsSkeleton";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { ActivityChart } from "../../components/admin/dashboard/ActivityChart";
import { RecentSignupsList } from "@/components/admin/dashboard/RecentSignupsList";
import { RecentSignupsSkeleton } from "@/components/skeletons/RecentSignupsSkeleton";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Command Center",
};

export default function AdminDashboard() {
    return (
        <div className="container mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard Overview</h2>
            <p className="text-zinc-500 mb-8">Welcome back, Admin. Here is what is happening today.</p>

            {/* Top Stats - Streaming */}
            <Suspense fallback={<AdminStatsSkeleton />}>
                <AdminStatsWrapper />
            </Suspense>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 h-[400px]">
                    <RevenueChart />
                </div>
                <div className="lg:col-span-1 h-[400px]">
                    <ActivityChart />
                </div>
            </div>

            {/* Recent Signups Section */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    Recent Joiners
                    <span className="text-xs font-normal text-zinc-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">Real-time</span>
                </h3>
                <div className="p-6 rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
                    <Suspense fallback={<RecentSignupsSkeleton />}>
                        <RecentSignupsList />
                    </Suspense>
                </div>
            </div>

            {/* Dashboard Footer / Space */}
            <div className="h-4" />
        </div>
    );
}

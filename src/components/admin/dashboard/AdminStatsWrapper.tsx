import { getDashboardStats } from "@/actions/admin-stats";
import { StatsGrid } from "./StatsGrid";

export async function AdminStatsWrapper() {
    const stats = await getDashboardStats();

    return (
        <StatsGrid
            totalStudents={stats.totalStudents}
            activeSubscriptions={stats.vipStudents}
            totalRevenue={stats.totalRevenue}
            activeSessions={stats.activeOnline}
        />
    );
}

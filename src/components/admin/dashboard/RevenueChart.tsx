import { RevenueChartClient } from "@/components/admin/dashboard/RevenueChartClient";
import { getRevenueStats } from "@/actions/admin-stats";

export async function RevenueChart() {
    const data = await getRevenueStats();

    return (
        <div className="w-full h-full p-6 rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
                    <p className="text-sm text-zinc-500">Monthly revenue Analytics</p>
                </div>
                <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-sm text-zinc-400 focus:outline-none">
                    <option>Last 6 Months</option>
                </select>
            </div>

            <div className="h-[300px] w-full">
                <RevenueChartClient data={data} />
            </div>
        </div>
    );
}

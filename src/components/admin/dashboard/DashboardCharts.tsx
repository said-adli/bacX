'use client';

import { AdminGlassCard } from "../ui/AdminGlassCard";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export function RevenueChart({ total }: { total: number }) {
    // Simulated data for visual effect
    const bars = [40, 65, 50, 80, 55, 90, 70, 95, 85, 100, 75, 60];

    return (
        <AdminGlassCard className="h-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Revenue Flow</h3>
                    <p className="text-xs text-gray-400">Past 12 Weeks</p>
                </div>
                <div className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                    +12.5%
                </div>
            </div>

            <div className="flex h-48 items-end justify-between gap-2">
                {bars.map((height, i) => (
                    <div key={i} className="group relative w-full rounded-t-lg bg-blue-500/10 hover:bg-blue-500/30 transition-all cursor-pointer">
                        <div
                            style={{ height: `${height}%` }}
                            className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 opacity-60 group-hover:opacity-100 transition-opacity"
                        ></div>
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            ${height * 250}
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-center text-sm font-bold text-white">
                Total Generated: <span className="text-blue-400">${total.toLocaleString()}</span>
            </p>
        </AdminGlassCard>
    );
}

export function ActivityHeatmap({ active }: { active: number }) {
    return (
        <AdminGlassCard className="h-full">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">Live Activity</h3>
                    <p className="text-xs text-gray-400">Real-time user engagement</p>
                </div>
                <Activity className="h-5 w-5 text-pink-400" />
            </div>

            <div className="relative flex h-48 items-center justify-center">
                {/* Pulse Effect */}
                <div className="absolute h-32 w-32 animate-ping rounded-full bg-pink-500/10"></div>
                <div className="absolute h-24 w-24 animate-pulse rounded-full bg-pink-500/20"></div>

                <div className="relative z-10 text-center">
                    <span className="block text-4xl font-black text-white">{active}</span>
                    <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">Online Now</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="text-lg font-bold text-white">85%</div>
                    <div className="text-[10px] text-gray-500">Video Completion</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="text-lg font-bold text-white">4.2m</div>
                    <div className="text-[10px] text-gray-500">Avg Session</div>
                </div>
            </div>
        </AdminGlassCard>
    );
}

import { getStatsData } from "@/actions/dashboard";
import { Clock, TrendingUp, Zap } from "lucide-react";

import { User } from "@supabase/supabase-js";

export default async function StatsOverview({ user }: { user: User }) {
    // 1. Fetch Data
    const stats = await getStatsData(user.id);

    // 2. Render
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
            {[
                { label: "المواد المتاحة", value: stats.courses, icon: Zap, color: "text-yellow-400" },
                { label: "ساعات التعلم", value: stats.hours, icon: Clock, color: "text-blue-400" },
                { label: "الترتيب العام", value: stats.rank, icon: TrendingUp, color: "text-green-400" },
            ].map((stat, i) => (
                <div key={i} className="glass-card p-6 flex items-center justify-between hover:bg-white/10 cursor-default">
                    <div>
                        <p className="text-sm text-white/40 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold font-serif">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                </div>
            ))}
        </div>
    );
}

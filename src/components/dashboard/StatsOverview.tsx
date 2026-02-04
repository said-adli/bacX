import { getStatsData } from "@/actions/dashboard";
import { Clock, TrendingUp, Zap } from "lucide-react";

import { User } from "@supabase/supabase-js";

export default async function StatsOverview({ user }: { user: User }) {
    // 1. Fetch Data
    const stats = await getStatsData(user.id);

    // Mock progress calculation (Visual Only since we lack max values)
    const items = [
        { label: "المواد المتاحة", value: stats.courses, icon: Zap, color: "text-amber-400", progress: 85 },
        { label: "ساعات التعلم", value: stats.hours, icon: Clock, color: "text-blue-400", progress: 65 },
        { label: "الترتيب العام", value: stats.rank, icon: TrendingUp, color: "text-emerald-400", progress: 92 },
    ];

    // 2. Render
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
            {items.map((stat, i) => {
                const radius = 32;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (stat.progress / 100) * circumference;

                return (
                    <div key={i} className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl">

                        {/* Glow Effect */}
                        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${stat.color.replace('text-', 'bg-')}`} />

                        <div className="flex items-center gap-6">
                            {/* Circular Progress */}
                            <div className="relative w-[88px] h-[88px] flex-shrink-0">
                                {/* Rings */}
                                <svg className="w-full h-full -rotate-90 transform">
                                    {/* Track */}
                                    <circle
                                        cx="44"
                                        cy="44"
                                        r={radius}
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        className="text-white/5"
                                    />
                                    {/* Progress */}
                                    <circle
                                        cx="44"
                                        cy="44"
                                        r={radius}
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className={`${stat.color} transition-all duration-1000 ease-out`}
                                    />
                                </svg>

                                {/* Icon Center */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <stat.icon className={`w-6 h-6 ${stat.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />

                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col z-10">
                                <span className="text-sm font-medium text-white/50 mb-1">{stat.label}</span>
                                <span className="text-3xl font-bold font-serif text-white tracking-wide">
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

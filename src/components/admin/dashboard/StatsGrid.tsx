"use client";

import { Users, CreditCard, Activity, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
    totalStudents: number;
    activeSubscriptions: number;
    totalRevenue: number;
    activeSessions: number;
}

export function StatsGrid({ totalStudents, activeSubscriptions, totalRevenue, activeSessions }: StatsGridProps) {

    const stats = [
        {
            label: "Total Students",
            value: totalStudents.toLocaleString(),
            change: "+12%",
            trend: "up",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        },
        {
            label: "Monthly Revenue",
            value: `${totalRevenue.toLocaleString()} DZD`,
            change: "+8.2%",
            trend: "up",
            icon: CreditCard,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20"
        },
        {
            label: "Active Subscriptions",
            value: activeSubscriptions.toLocaleString(),
            change: "-2.5%",
            trend: "down",
            icon: Activity,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20"
        },
        {
            label: "Live Sessions",
            value: activeSessions.toString(),
            change: "+0%",
            trend: "neutral",
            icon: Eye,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className={cn(
                        "p-6 rounded-2xl border backdrop-blur-sm bg-black/20 transition-all hover:-translate-y-1 hover:shadow-lg",
                        stat.border
                    )}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-xl", stat.bg)}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        {stat.trend === "up" && <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full"><TrendingUp size={12} /> {stat.change}</div>}
                        {stat.trend === "down" && <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded-full"><TrendingDown size={12} /> {stat.change}</div>}
                    </div>

                    <div>
                        <p className="text-zinc-400 text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
}

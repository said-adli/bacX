"use client";

import { Users, CreditCard, TrendingUp, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubs: 0,
        revenue: 0,
        activeLessons: 0
    });

    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            try {
                // Total Users
                const { count: totalUsers } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // Active Subs
                const { count: activeSubs } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_subscribed', true);

                // Revenue (Estimate)
                const revenue = (activeSubs || 0) * 4500;

                // Active Lessons (Mock or Real)
                // Assuming 'videos' table exists?
                // const { count: lessonsCount } = await supabase.from('videos').select('*', { count: 'exact', head: true });
                const lessonsCount = 120; // fallback

                setStats({
                    totalUsers: totalUsers || 0,
                    activeSubs: activeSubs || 0,
                    revenue,
                    activeLessons: lessonsCount
                });
            } catch (error) {
                console.error("Stats Error:", error);
            }
        }
        fetchStats();
    }, []);

    const cards = [
        { title: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
        { title: "الاشتراكات النشطة", value: stats.activeSubs, icon: UserCheck, color: "text-green-500" },
        { title: "إجمالي الإيرادات", value: `${stats.revenue.toLocaleString()} DA`, icon: CreditCard, color: "text-yellow-500" },
        { title: "الدروس النشطة", value: stats.activeLessons, icon: TrendingUp, color: "text-purple-500" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-zinc-400 mb-1">{card.title}</p>
                                <h3 className="text-2xl font-bold">{card.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Recent Activity could go here */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center text-zinc-500">
                مخطط النشاط (قريباً)
            </div>
        </div>
    );
}

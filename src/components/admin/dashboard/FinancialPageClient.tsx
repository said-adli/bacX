"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock data structure if real analytics_revenue view doesn't exist
// We will aggregate from payments passed as prop
interface Payment {
    id: string;
    amount: number;
    created_at: string;
    status: string;
    plan_id: string; // or plan name joined
    profiles?: { email: string };
}

export default function FinancialPageClient({ payments }: { payments: Payment[] }) {
    // Aggregation Logic
    const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const monthlyData = payments.reduce((acc, p) => {
        const month = format(new Date(p.created_at), 'MMM');
        acc[month] = (acc[month] || 0) + Number(p.amount);
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(monthlyData).map(([name, value]) => ({ name, value }));

    return (
        <div className="container mx-auto max-w-7xl pb-20">
            <h2 className="text-3xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
                <TrendingUp className="text-green-500" /> Financial Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-sm">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</h3>
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-sm">Total Transactions</p>
                            <h3 className="text-2xl font-bold text-white">{payments.length}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-6 h-[400px]">
                <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <XAxis dataKey="name" stroke="#52525b" />
                        <YAxis stroke="#52525b" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </GlassCard>
        </div>
    );
}

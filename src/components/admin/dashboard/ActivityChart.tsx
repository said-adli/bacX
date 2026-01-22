"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'Mon', active: 400 },
    { name: 'Tue', active: 300 },
    { name: 'Wed', active: 550 },
    { name: 'Thu', active: 450 },
    { name: 'Fri', active: 600 },
    { name: 'Sat', active: 800 },
    { name: 'Sun', active: 750 },
];

export function ActivityChart() {
    return (
        <div className="w-full h-full p-6 rounded-2xl border border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">User Activity</h3>
                    <p className="text-sm text-zinc-500">Active sessions this week</p>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#71717a"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="active" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 5 ? '#a855f7' : '#3f3f46'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

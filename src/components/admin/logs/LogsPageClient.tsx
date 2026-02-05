"use client";

import { useState } from "react";
import {
    Shield,
    Search,
    Filter,
    Clock,
    User,
    AlertTriangle,
    Terminal,
    X
} from "lucide-react";
import { getSecurityLogs, LogEntry } from "@/actions/admin-logs";
import { useRouter } from "next/navigation";

interface InitialLogsData { logs: LogEntry[] }

export default function LogsPage({ initialLogs }: { initialLogs: InitialLogsData }) {
    const [logs] = useState<LogEntry[]>(initialLogs.logs);
    const router = useRouter();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Simple Popover Filter state (URL driven filtering is better but let's do simple UI toggle for now to switch filter modes)
    // The actual filtering happens via Server Action params 'filter'.

    const handleFilterChange = (val: string) => {
        const params = new URLSearchParams(window.location.search);
        if (val === 'all') params.delete('filter');
        else params.set('filter', val);
        router.push(`?${params.toString()}`);
        setIsFilterOpen(false);
    };

    return (
        <div className="container mx-auto max-w-7xl pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Terminal className="text-blue-500" /> System Logs
                    </h2>
                    <p className="text-zinc-500">Audit trail of security events and user activity.</p>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`px-4 py-2 border rounded-xl text-zinc-400 hover:text-white flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' : 'bg-black/20 border-white/5'}`}
                    >
                        <Filter size={18} /> Filter
                    </button>

                    {/* Filter Popover */}
                    {isFilterOpen && (
                        <div className="absolute top-12 right-0 w-48 bg-[#0A0A15] border border-white/10 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <button onClick={() => handleFilterChange('all')} className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                                All Events
                            </button>
                            <button onClick={() => handleFilterChange('admin_only')} className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                                Admin Actions
                            </button>
                            <button onClick={() => handleFilterChange('system')} className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
                                System / Errors
                            </button>
                        </div>
                    )}

                    <button className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-bold hover:bg-blue-600/20 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm font-mono text-sm">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 border-b border-white/5">
                        <tr>
                            <th className="p-4 font-normal">Timestamp</th>
                            <th className="p-4 font-normal">Event</th>
                            <th className="p-4 font-normal">Actor / User</th>
                            <th className="p-4 font-normal">IP Address</th>
                            <th className="p-4 font-normal">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4 text-zinc-500 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getEventColor(log.event)}`}>
                                        {log.event}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {log.profiles ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                                {log.profiles.full_name?.[0] || "?"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-300 text-xs">{log.profiles.email}</span>
                                                <span className="text-[10px] text-zinc-500 uppercase">{log.profiles.role}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-600 italic">System / Anon</span>
                                    )}
                                </td>
                                <td className="p-4 text-zinc-500">
                                    {log.ip_address || "-"}
                                </td>
                                <td className="p-4 text-zinc-400 max-w-[300px] truncate">
                                    {JSON.stringify(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="p-12 text-center text-zinc-500">
                        No logs found for this period.
                    </div>
                )}
            </div>
        </div>
    );
}

function getEventColor(event: string) {
    const e = event.toLowerCase();
    if (e.includes("login")) return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (e.includes("ban") || e.includes("fail")) return "bg-red-500/10 text-red-500 border border-red-500/20";
    if (e.includes("admin") || e.includes("broadcast")) return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
}

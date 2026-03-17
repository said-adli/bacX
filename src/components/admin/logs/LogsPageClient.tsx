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
import { exportLogsAsCSV } from "@/actions/admin-export";
import { toast } from "sonner";

import { LogsResponse } from "@/actions/admin-logs";

export default function LogsPageClient({ initialLogs }: { initialLogs: LogsResponse }) {
    const { logs } = initialLogs;

    // ... inside component
    const handleExport = async () => {
        try {
            toast.loading("جاري التحضير للتصدير...");
            const csvData = await exportLogsAsCSV();
            if (!csvData) {
                toast.dismiss();
                toast.error("لا توجد سجلات لتصديرها");
                return;
            }

            // Client-side download
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `admin-logs-${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.dismiss();
            toast.success("تم تصدير السجلات بنجاح");
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("فشل تصدير السجلات");
        }
    };

    function getEventColor(event: string) {
        const e = event.toLowerCase();
        if (e.includes("login")) return "bg-green-500/10 text-green-400 border border-green-500/20";
        if (e.includes("ban") || e.includes("fail")) return "bg-red-500/10 text-red-500 border border-red-500/20";
        if (e.includes("admin") || e.includes("broadcast")) return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }

    return (
        <div className="container mx-auto max-w-7xl pb-20">
            <div className="flex items-center justify-between mb-8">
                {/* ... existing headers ... */}
                <div>
                    {/* ... */}
                </div>
                <div className="flex gap-2 relative">
                    {/* ... Filter button ... */}

                    {/* ... Popover ... */}

                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-bold hover:bg-blue-600/20 transition-colors"
                    >
                        تصدير البيانات
                    </button>
                </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm font-mono text-sm">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 border-b border-white/5">
                        <tr>
                            <th className="p-4 font-normal">الوقت والتاريخ</th>
                            <th className="p-4 font-normal">الحدث</th>
                            <th className="p-4 font-normal">الفاعل / المستخدم</th>
                            <th className="p-4 font-normal">عنوان IP</th>
                            <th className="p-4 font-normal">التفاصيل</th>
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
                                        <span className="text-zinc-600 italic">النظام / مجهول</span>
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
                        لم يتم العثور على سجلات في هذه الفترة.
                    </div>
                )}
            </div>
        </div>
    );
}

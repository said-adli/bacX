"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    MoreVertical,
    ShieldAlert,
    CheckCircle,
    XCircle,
    Clock,
    Filter
} from "lucide-react";
import { toggleBanStudent, manualsExpireSubscription } from "@/actions/admin-students";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StudentTable({ students, totalPages }: { students: any[], totalPages: number }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Filter Logic can be added here pushing to URL
    // e.g. ?filter=expired

    const handleBan = async (id: string, currentStatus: boolean) => {
        if (!confirm(currentStatus ? "Unban this student?" : "Ban this student?")) return;
        setIsLoading(true);
        try {
            await toggleBanStudent(id, !currentStatus);
            toast.success("Student status updated");
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTerminate = async (id: string) => {
        if (!confirm("Are you sure you want to terminate this subscription immediately?")) return;
        setIsLoading(true);
        try {
            await manualsExpireSubscription(id);
            toast.success("Subscription terminated");
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        placeholder="Search students..."
                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                        onChange={(e) => {
                            // Debounce implementation for search would go here
                        }}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-zinc-400 hover:text-white flex items-center gap-2">
                        <Filter size={18} />
                        Filters
                    </button>
                    <select
                        className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-zinc-400 focus:outline-none"
                        onChange={(e) => {
                            const params = new URLSearchParams(window.location.search);
                            params.set("filter", e.target.value);
                            router.push(`?${params.toString()}`);
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 font-medium text-sm text-right">
                        <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Wilaya</th>
                            <th className="p-4">System</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-right">
                        {students.map((student) => (
                            <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                                            {student.full_name?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white max-w-[150px] truncate">{student.full_name || "Unknown"}</p>
                                            <p className="text-xs text-zinc-500 max-w-[150px] truncate">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-zinc-400">{student.wilaya || "-"}</td>
                                <td className="p-4 text-zinc-400">{student.study_system || "-"}</td>
                                <td className="p-4">
                                    {student.is_banned ? (
                                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 flex w-fit items-center gap-1">
                                            <ShieldAlert size={12} /> BANNED
                                        </span>
                                    ) : student.is_subscribed ? (
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex w-fit items-center gap-1">
                                            <CheckCircle size={12} /> ACTIVE
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-500 text-xs font-bold border border-zinc-500/20 flex w-fit items-center gap-1">
                                            <Clock size={12} /> EXPIRED
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleBan(student.id, student.is_banned)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title={student.is_banned ? "Unban" : "Ban User"}
                                        >
                                            <ShieldAlert size={16} />
                                        </button>

                                        {student.is_subscribed && (
                                            <button
                                                onClick={() => handleTerminate(student.id)}
                                                className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                                                title="Terminate Subscription"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {students.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                        No students found matching your criteria.
                    </div>
                )}
            </div>

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {/* Add pagination logic later */}
                    <button className="px-3 py-1 rounded bg-white/5 text-zinc-400">Prev</button>
                    <span className="px-3 py-1 text-white">Page 1</span>
                    <button className="px-3 py-1 rounded bg-white/5 text-zinc-400">Next</button>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    MoreVertical,
    ShieldAlert,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    MessageSquare,
    Send,
    Edit // [NEW]
} from "lucide-react";
import { toggleBanStudent, manualsExpireSubscription } from "@/actions/admin-students";
import { bulkBroadcast } from "@/actions/admin-broadcast";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { ManageSubscriptionModal } from "./ManageSubscriptionModal"; // [NEW]

interface Student {
    id: string;
    full_name: string | null;
    email: string | null;
    wilaya: string | null;
    study_system: string | null;
    is_banned: boolean;
    is_subscribed: boolean;
    created_at: string;
    avatar_url?: string;
    subscription_end_date?: string | null;
}

export function StudentTable({ students, totalPages }: { students: Student[], totalPages: number }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // [NEW] Debounced Search Logic
    const [searchTerm, setSearchTerm] = useState(
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("query") || "" : ""
    );
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms Delay

    // Effect: Trigger Router ONLY when debounced value changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (debouncedSearchTerm) {
            params.set("query", debouncedSearchTerm);
        } else {
            params.delete("query");
        }
        params.set("page", "1");
        router.replace(`?${params.toString()}`);
    }, [debouncedSearchTerm, router]);

    // Filter Logic can be added here pushing to URL
    // e.g. ?filter=expired

    // [NEW] Optimistic UI
    const [optimisticStudents, setOptimisticStatus] = useOptimistic<Student[], { id: string; is_banned: boolean }>(
        students,
        (state, { id, is_banned }) =>
            state.map((s) => (s.id === id ? { ...s, is_banned } : s))
    );

    const handleBan = async (id: string, currentStatus: boolean) => {
        // Optimistic Update (Instant Red/Green Toggle)
        // Optimistic Update (Instant Red/Green Toggle)
        const newStatus = !currentStatus;
        startTransition(() => {
            setOptimisticStatus({ id, is_banned: newStatus });
        });

        try {
            await toggleBanStudent(id, newStatus);
            toast.success(newStatus ? "User Banned" : "User Unbanned");
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
            // Revert is automatic on refresh, but ideally we'd revert optimistic state here if needed.
            // Since router.refresh() re-fetches, it corrects itself.
        }
    };

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [managingStudent, setManagingStudent] = useState<any | null>(null); // [NEW] State for Modal

    // BULK ACTIONS
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(students.map(s => s.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSet = new Set(selectedIds);
        if (checked) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkAction = async (action: 'ban' | 'unban' | 'expire') => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} ${selectedIds.size} users?`)) return;

        setIsLoading(true);
        // Dynamic import to avoid circular dependency issues if any, or just standard import
        const { bulkUpdateStudents } = await import("@/actions/admin-students");

        try {
            await bulkUpdateStudents(Array.from(selectedIds), action);
            toast.success(`Bulk ${action} successful`);
            setSelectedIds(new Set()); // Reset selection
            router.refresh();
        } catch (e) {
            toast.error("Bulk action failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) {
            toast.error("Message cannot be empty.");
            return;
        }
        setIsLoading(true);
        try {
            await bulkBroadcast(Array.from(selectedIds), broadcastMessage);
            toast.success("Messages sent successfully!");
            setIsBroadcastOpen(false);
            setBroadcastMessage("");
            setSelectedIds(new Set()); // Reset selection
            router.refresh();
        } catch (e) {
            toast.error("Failed to send messages.");
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
                        placeholder="Search name, email, or phone..."
                        value={searchTerm} // Controlled Input
                        onChange={(e) => setSearchTerm(e.target.value)} // Instant local update
                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
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
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-white/20 bg-black/20 text-blue-600 focus:ring-blue-500"
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={selectedIds.size === students.length && students.length > 0}
                                />
                            </th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Wilaya</th>
                            <th className="p-4">System</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-right">
                        {optimisticStudents.map((student) => (
                            <tr
                                key={student.id}
                                className={`group transition-colors cursor-pointer ${selectedIds.has(student.id) ? 'bg-blue-900/10' : 'hover:bg-white/5'}`}
                                onClick={(e) => {
                                    // Prevent navigation if clicking checkbox or action buttons
                                    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('button')) return;
                                    router.push(`/admin/students/${student.id}`);
                                }}
                            >
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-white/20 bg-black/20 text-blue-600 focus:ring-blue-500"
                                        checked={selectedIds.has(student.id)}
                                        onChange={(e) => handleSelectRow(student.id, e.target.checked)}
                                    />
                                </td>
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
                                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 flex w-fit items-center gap-1 animate-in fade-in zoom-in duration-300">
                                            <ShieldAlert size={12} /> BANNED
                                        </span>
                                    ) : student.is_subscribed ? (
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex w-fit items-center gap-1 animate-in fade-in zoom-in duration-300">
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBan(student.id, student.is_banned);
                                            }}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                            title={student.is_banned ? "Unban" : "Ban User"}
                                        >
                                            <ShieldAlert size={16} />
                                        </button>

                                        {student.is_subscribed && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTerminate(student.id)
                                                }}
                                                className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                                                title="Terminate Subscription"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setManagingStudent(student);
                                            }}
                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                                            title="Manage Subscription"
                                        >
                                            <Edit size={16} />
                                        </button>
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
            {/* BULK ACTION BAR */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0A0A15] border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-4 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                            {selectedIds.size}
                        </div>
                        <span className="text-white font-medium">Selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('ban')}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <ShieldAlert size={16} /> Ban Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction('unban')}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <CheckCircle size={16} /> Unban
                        </button>
                        <button
                            onClick={() => handleBulkAction('expire')}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <XCircle size={16} /> Expire
                        </button>
                        <button
                            onClick={() => setIsBroadcastOpen(true)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <MessageSquare size={16} /> Send Message
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="ml-2 text-zinc-500 hover:text-white"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
            )}

            {/* BROADCAST MODAL */}
            {isBroadcastOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-[#0A0A15] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Send size={20} className="text-blue-500" /> Broadcast Message
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Sending to <b className="text-white">{selectedIds.size}</b> selected students.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Message</label>
                                <textarea
                                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                                    placeholder="Type your announcement here..."
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsBroadcastOpen(false)}
                                    className="px-4 py-2 text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBroadcast}
                                    disabled={isLoading || !broadcastMessage.trim()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* MANAGE SUBSCRIPTION MODAL */}
            {managingStudent && (
                <ManageSubscriptionModal
                    student={managingStudent}
                    onClose={() => setManagingStudent(null)}
                    onSuccess={() => {
                        router.refresh(); // Refresh table data
                    }}
                />
            )}
        </div>
    );
}

'use client';

import { useState } from "react";
import { Student, toggleBanUser, updateSubscription } from "@/actions/admin-student-actions";
import { AdminGlassCard } from "../ui/AdminGlassCard";
import { AdminEmptyState } from "../ui/AdminEmptyState";
import { StatusBadge } from "../ui/StatusBadge";
import { toast } from "sonner";
import { Search, MoreVertical, ShieldAlert, ShieldCheck, Zap, UserX } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudentsTableProps {
    initialStudents: Student[];
    totalCount: number;
}

export function StudentsTable({ initialStudents, totalCount }: StudentsTableProps) {
    const [students] = useState<Student[]>(initialStudents);
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggleBan = async (student: Student) => {
        // Optimistic update logic or simple loading state
        if (!confirm(`Are you sure you want to ${student.banned_until ? "unban" : "ban"} this user?`)) return;

        setLoadingId(student.id);
        const result = await toggleBanUser(student.id, !student.banned_until); // Logic depends on how we mapped `is_banned` in action

        if (result.success) {
            toast.success("User status updated");
            router.refresh();
        } else {
            toast.error("Failed to update status");
        }
        setLoadingId(null);
    };

    const handleToggleSub = async (student: Student) => {
        setLoadingId(student.id);
        const result = await updateSubscription(student.id, !student.is_subscribed);

        if (result.success) {
            toast.success("Subscription updated");
            router.refresh();
        } else {
            toast.error("Failed to update subscription");
        }
        setLoadingId(null);
    };

    if (students.length === 0) {
        return (
            <AdminEmptyState
                title="No Students Found"
                description="Try adjusting your search filters or wait for new signups."
                icon="search"
            />
        );
    }

    return (
        <AdminGlassCard className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Subscription</th>
                            <th className="px-6 py-4 font-medium">Joined</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {students.map((student) => {
                            const isBanned = !!student.banned_until; // Basic check
                            const isSubscribed = student.is_subscribed;

                            return (
                                <tr key={student.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 font-bold">
                                                {student.full_name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{student.full_name || "Unknown"}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isBanned ? (
                                            <StatusBadge status="error">Banned</StatusBadge>
                                        ) : (
                                            <StatusBadge status="success">Active</StatusBadge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isSubscribed ? (
                                            <StatusBadge status="info" pulse>Premium</StatusBadge>
                                        ) : (
                                            <StatusBadge status="neutral">Free</StatusBadge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(student.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleToggleSub(student)}
                                                disabled={loadingId === student.id}
                                                title={isSubscribed ? "Revoke Access" : "Grant Access"}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                                            >
                                                <Zap className={`h-4 w-4 ${isSubscribed ? "text-yellow-400" : "text-gray-400"}`} />
                                            </button>

                                            <button
                                                onClick={() => handleToggleBan(student)}
                                                disabled={loadingId === student.id}
                                                title={isBanned ? "Unban User" : "Ban User"}
                                                className="rounded-lg p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                                            >
                                                {isBanned ? <ShieldCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminGlassCard>
    );
}

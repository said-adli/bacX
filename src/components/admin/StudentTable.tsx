"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    MoreVertical,
    Shield,
    ShieldOff,
    Eye,
    Filter
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { AdminStudentProp } from "@/actions/admin-student-management";
import { StudentManagementModal } from "./StudentManagementModal";

interface StudentTableProps {
    data: AdminStudentProp[];
}

export function StudentTable({ data }: StudentTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<AdminStudentProp | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Client-side filtering wrapper (server does main search)
    // We can also trigger server search via router.replace
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        // Debounce logic could be here for server search
        // For now we just update UI state, but ideally we push to URL
        const params = new URLSearchParams(window.location.search);
        if (term) params.set("query", term);
        else params.delete("query");
        router.replace(`?${params.toString()}`);
    };

    const handleRowClick = (student: AdminStudentProp) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <StudentManagementModal
                student={selectedStudent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={() => router.refresh()}
            />

            {/* Search Bar & Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <Input
                        placeholder="Search by name..."
                        defaultValue={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-black/20 border-zinc-800 focus:border-blue-500/50"
                    />
                </div>
                <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors">
                    <Filter size={18} />
                </button>
            </div>

            {/* Table */}
            <GlassCard className="overflow-hidden border-zinc-800 p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-zinc-500 bg-white/5 font-tajawal text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium text-right">Full Name / Email</th>
                                <th className="px-6 py-4 font-medium text-right">Wilaya</th>
                                <th className="px-6 py-4 font-medium text-right">System</th>
                                <th className="px-6 py-4 font-medium text-right">Subscription</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                data.map((student) => (
                                    <tr
                                        key={student.id}
                                        onClick={() => handleRowClick(student)}
                                        className="hover:bg-blue-600/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white font-tajawal text-base">{student.full_name || "Unknown"}</span>
                                                <span className="text-xs text-zinc-500 font-mono">{student.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300 font-tajawal">{student.wilaya || "-"}</td>
                                        <td className="px-6 py-4 text-zinc-400">{student.study_system || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            {student.banned ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                                    BANNED
                                                </span>
                                            ) : student.is_subscribed ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        ACTIVE
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        ({student.days_remaining} days)
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-zinc-800 text-zinc-500 border border-white/5">
                                                    INACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="p-2 rounded-full hover:bg-white/10 text-zinc-500 hover:text-blue-400 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}

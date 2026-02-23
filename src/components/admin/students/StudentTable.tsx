"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import {
    Search,
    Filter,
    Edit,
    Trash2,
    VenetianMask,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { StatusToggle } from "@/components/admin/shared/StatusToggle";
import { manualsExpireSubscription, generateImpersonationLink, deleteStudent } from "@/actions/admin-students";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { ManageSubscriptionModal } from "./ManageSubscriptionModal";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";

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
    plan_id: string | null;
}

export function StudentTable({ students, totalPages }: { students: Student[], totalPages: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || "");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [managingStudent, setManagingStudent] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [studentToExpire, setStudentToExpire] = useState<Student | null>(null);
    const [studentToImpersonate, setStudentToImpersonate] = useState<Student | null>(null);

    // Sync Search to URL
    useMemo(() => {
        const params = new URLSearchParams(searchParams);
        if (debouncedSearchTerm) {
            params.set("query", debouncedSearchTerm);
        } else {
            params.delete("query");
        }
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    }, [debouncedSearchTerm, pathname, router, searchParams]);

    const handleTerminate = async () => {
        if (!studentToExpire) return;
        setIsLoading(true);
        try {
            await manualsExpireSubscription(studentToExpire.id);
            toast.success("Subscription terminated");
            setStudentToExpire(null);
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImpersonate = async () => {
        if (!studentToImpersonate) return;
        setIsLoading(true);
        try {
            const magicLink = await generateImpersonationLink(studentToImpersonate.id);
            if (magicLink) {
                toast.success("Redirecting to student view...");
                window.open(magicLink, '_blank');
            }
        } catch (e) {
            toast.error("Impersonation failed");
        } finally {
            setIsLoading(false);
            setStudentToImpersonate(null);
        }
    }

    const handleDelete = async () => {
        if (!studentToDelete) return;
        setIsLoading(true);
        try {
            await deleteStudent(studentToDelete.id);
            toast.success("Student deleted permanently");
            setStudentToDelete(null);
            router.refresh();
        } catch (e) {
            toast.error("Delete failed");
        } finally {
            setIsLoading(false);
        }
    }

    // TanStack Table Definition
    const columnHelper = createColumnHelper<Student>();

    const columns = useMemo(() => [
        columnHelper.accessor(row => row, {
            id: 'student',
            header: 'Student',
            cell: info => {
                const student = info.getValue();
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 flex-shrink-0">
                            {student.full_name?.[0] || "?"}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white truncate">{student.full_name || "Unknown"}</p>
                            <p className="text-xs text-zinc-500 truncate">{student.email}</p>
                        </div>
                    </div>
                );
            }
        }),
        columnHelper.accessor('wilaya', {
            header: () => <div className="text-right">Wilaya</div>,
            cell: info => <div className="text-right text-zinc-400 truncate">{info.getValue() || "-"}</div>
        }),
        columnHelper.accessor('study_system', {
            header: () => <div className="text-right">System</div>,
            cell: info => <div className="text-right text-zinc-400 truncate">{info.getValue() || "-"}</div>
        }),
        columnHelper.accessor(row => row, {
            id: 'status',
            header: () => <div className="text-right">Status</div>,
            cell: info => {
                const student = info.getValue();
                return (
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <StatusToggle
                            table="profiles"
                            id={student.id}
                            field="is_banned"
                            initialValue={student.is_banned}
                            labelActive="BANNED"
                            labelInactive="OK"
                        />
                        {student.is_subscribed ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex w-fit items-center gap-1">
                                <CheckCircle size={12} /> ACTIVE
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-500 text-xs font-bold border border-zinc-500/20 flex w-fit items-center gap-1">
                                <Clock size={12} /> EXPIRED
                            </span>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor(row => row, {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: info => {
                const student = info.getValue();
                return (
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {student.is_subscribed && (
                            <button
                                onClick={() => setStudentToExpire(student)}
                                className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                                title="Terminate Subscription"
                            >
                                <XCircle size={16} />
                            </button>
                        )}

                        <button
                            onClick={() => setManagingStudent(student)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                            title="Manage Subscription"
                        >
                            <Edit size={16} />
                        </button>

                        <button
                            onClick={() => setStudentToImpersonate(student)}
                            className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                            title="Impersonate User (God Mode)"
                        >
                            <VenetianMask size={16} />
                        </button>

                        <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Delete Student"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            }
        })
    ], [columnHelper]);

    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        placeholder="Search name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-zinc-400 hover:text-white flex items-center gap-2">
                        <Filter size={18} />
                        Filters
                    </button>
                    <select
                        className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-zinc-400 focus:outline-none appearance-none"
                        value={searchParams.get('filter') || 'all'}
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("filter", e.target.value);
                            router.push(`${pathname}?${params.toString()}`);
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
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-white/5 text-zinc-400 font-medium text-sm border-b border-white/5">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 py-5 uppercase tracking-wider text-xs whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => router.push(`/admin/students/${row.original.id}`)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {students.length === 0 && (
                        <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
                            <Search className="opacity-20" size={48} />
                            <p>No students found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors">Prev</button>
                    <span className="px-4 py-2 text-white font-medium bg-blue-600/20 border border-blue-500/30 rounded-lg">Page 1</span>
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors">Next</button>
                </div>
            )}

            {/* Modals for actions */}
            {managingStudent && (
                <ManageSubscriptionModal
                    student={managingStudent}
                    onClose={() => setManagingStudent(null)}
                    onSuccess={() => router.refresh()}
                />
            )}

            <AlertDialog open={!!studentToExpire} onOpenChange={(open) => !open && setStudentToExpire(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Terminate Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to immediately expire the subscription for <strong>{studentToExpire?.full_name}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleTerminate}>Yes, Terminate</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!studentToImpersonate} onOpenChange={(open) => !open && setStudentToImpersonate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Impersonate Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to generate a magic link and log in as <strong>{studentToImpersonate?.full_name}</strong>? This action will be logged.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleImpersonate}>Impersonate</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>DANGER:</strong> This will permanently delete <strong>{studentToDelete?.full_name}</strong> and all their data. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Yes, Delete Permanently</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

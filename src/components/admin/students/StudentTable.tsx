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
            toast.success("تم إنهاء الاشتراك");
            setStudentToExpire(null);
            router.refresh();
        } catch (e) {
            toast.error("فشلت العملية");
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
                toast.success("جاري التحويل إلى حساب الطالب...");
                window.open(magicLink, '_blank');
            }
        } catch (e) {
            toast.error("فشل تسجيل الدخول كطالب");
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
            toast.success("تم حذف الطالب نهائيا");
            setStudentToDelete(null);
            router.refresh();
        } catch (e) {
            toast.error("فشل الحذف");
        } finally {
            setIsLoading(false);
        }
    }

    // TanStack Table Definition
    const columnHelper = createColumnHelper<Student>();

    const columns = useMemo(() => [
        columnHelper.accessor(row => row, {
            id: 'student',
            header: 'الطالب',
            cell: info => {
                const student = info.getValue();
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30 flex-shrink-0">
                            {student.full_name?.[0] || "?"}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white truncate">{student.full_name || "مجهول"}</p>
                            <p className="text-xs text-zinc-500 truncate">{student.email}</p>
                        </div>
                    </div>
                );
            }
        }),
        columnHelper.accessor('wilaya', {
            header: () => <div className="text-right">الولاية</div>,
            cell: info => <div className="text-right text-zinc-400 truncate">{info.getValue() || "-"}</div>
        }),
        columnHelper.accessor('study_system', {
            header: () => <div className="text-right">النظام الدراسي</div>,
            cell: info => <div className="text-right text-zinc-400 truncate">{info.getValue() || "-"}</div>
        }),
        columnHelper.accessor(row => row, {
            id: 'status',
            header: () => <div className="text-right">الحالة</div>,
            cell: info => {
                const student = info.getValue();
                return (
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <StatusToggle
                            table="profiles"
                            id={student.id}
                            field="is_banned"
                            initialValue={student.is_banned}
                            labelActive="محظور"
                            labelInactive="سليم"
                        />
                        {student.is_subscribed ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex w-fit items-center gap-1">
                                <CheckCircle size={12} /> نشط
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-500 text-xs font-bold border border-zinc-500/20 flex w-fit items-center gap-1">
                                <Clock size={12} /> منتهي
                            </span>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor(row => row, {
            id: 'actions',
            header: () => <div className="text-right">إجراءات</div>,
            cell: info => {
                const student = info.getValue();
                return (
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {student.is_subscribed && (
                            <button
                                onClick={() => setStudentToExpire(student)}
                                className="p-2 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                                title="إنهاء الاشتراك"
                            >
                                <XCircle size={16} />
                            </button>
                        )}

                        <button
                            onClick={() => setManagingStudent(student)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                            title="إدارة الاشتراك"
                        >
                            <Edit size={16} />
                        </button>

                        <button
                            onClick={() => setStudentToImpersonate(student)}
                            className="p-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                            title="تسجيل الدخول كطالب"
                        >
                            <VenetianMask size={16} />
                        </button>

                        <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="حذف الطالب"
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
                    <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        placeholder="ابحث بالاسم، البريد الإلكتروني أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-12 pe-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-zinc-400 hover:text-white flex items-center gap-2">
                        <Filter size={18} />
                        تصفية
                    </button>
                    <select
                        className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl text-zinc-400 focus:outline-none flex-1 min-w-[150px]"
                        value={searchParams.get('filter') || 'all'}
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("filter", e.target.value);
                            router.push(`${pathname}?${params.toString()}`);
                        }}
                    >
                        <option value="all">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="expired">منتهي</option>
                        <option value="banned">محظور</option>
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
                            <p>لم يتم العثور على طلاب يطابقون بحثك.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Placeholder */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors">السابق</button>
                    <span className="px-4 py-2 text-white font-medium bg-blue-600/20 border border-blue-500/30 rounded-lg">الصفحة 1</span>
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors">التالي</button>
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
                        <AlertDialogTitle>إنهاء الاشتراك؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من رغبتك في الفسخ الفوري لاشتراك <strong>{studentToExpire?.full_name}</strong>؟
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleTerminate}>نعم، إنهاء</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!studentToImpersonate} onOpenChange={(open) => !open && setStudentToImpersonate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تسجيل الدخول كطالب؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من رغبتك في الدخول إلى حساب <strong>{studentToImpersonate?.full_name}</strong>؟ سيتم تسجيل هذه العملية.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleImpersonate}>دخول</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الطالب؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>تحذير:</strong> سيتم حذف <strong>{studentToDelete?.full_name}</strong> وجميع بياناته بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">نعم، حذف نهائي</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

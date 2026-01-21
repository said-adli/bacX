"use client";

import { useState, useEffect } from "react";
import { getStudents, Student } from "@/actions/admin-student-actions";
import { StudentsTable } from "@/components/admin/students/StudentsTable";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function StudentsPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const page = Number(searchParams.get("page")) || 1;
    const filter = (searchParams.get("filter") as 'all' | 'active' | 'banned' | 'vip') || "all";

    const [students, setStudents] = useState<Student[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setErrorMessage(null);
            try {
                // Mimic the student app's non-blocking fetch
                const res = await getStudents({
                    query,
                    page,
                    statusFilter: filter
                });
                setStudents(res.students);
                setTotalCount(res.totalCount);
            } catch (err: any) {
                console.error("Failed to fetch students", err);
                setErrorMessage(err.message || "Unknown error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [query, page, filter]);

    if (errorMessage) {
        return (
            <AdminEmptyState
                title="Error Fetching Data"
                description={`Error Details: ${errorMessage}`}
                icon="error"
            />
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white font-tajawal">الطلاب (Students)</h1>
                    <p className="text-gray-400 font-tajawal">إدارة حسابات واشتراكات الطلاب</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-white/50 animate-pulse font-tajawal">جاري تحميل داتا الطلاب...</p>
                </div>
            ) : (
                <StudentsTable
                    initialStudents={students}
                    totalCount={totalCount}
                />
            )}
        </div>
    );
}

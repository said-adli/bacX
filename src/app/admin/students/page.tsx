import { Suspense } from "react";
import { StudentTable } from "@/components/admin/students/StudentTable";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { getStudents } from "@/actions/admin-students";

export default async function AdminStudentsPage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        filter?: "all" | "active" | "expired" | "banned";
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const page = Number(searchParams?.page) || 1;
    const filter = searchParams?.filter || "all";

    const { students, totalPages } = await getStudents(page, query, filter);

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Student Management</h2>
                    <p className="text-zinc-500">Manage access, subscriptions, and security.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 rounded-xl text-white text-sm font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-colors">
                    Export CSV
                </button>
            </div>

            <Suspense fallback={<TableSkeleton />}>
                <StudentTable students={students} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}

import { Suspense } from "react";
import { StudentTable } from "@/components/admin/students/StudentTable";
import { ExportButton } from "@/components/admin/students/ExportButton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { getStudents } from "@/actions/admin-students";

export const metadata = {
  title: "إدارة الطلبة",
};


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
                    <h2 className="text-3xl font-bold text-white tracking-tight">إدارة الطلبة</h2>
                    <p className="text-zinc-500">إدارة الوصول، الاشتراكات، والحماية.</p>
                </div>
                <ExportButton />
            </div>

            <Suspense fallback={<TableSkeleton />}>
                <StudentTable students={students} totalPages={totalPages} />
            </Suspense>
        </div>
    );
}

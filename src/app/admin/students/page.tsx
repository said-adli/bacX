import { Suspense } from "react";
import { getAllStudents } from "@/actions/admin-student-management";
import { StudentTable } from "@/components/admin/StudentTable";

// Note: Ensure types for searchParams match Next.js 15
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function StudentsPage(props: {
    searchParams: SearchParams
}) {
    const searchParams = await props.searchParams;
    const query = typeof searchParams.query === 'string' ? searchParams.query : '';

    // Advanced Fetcher
    const students = await getAllStudents(query);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-tajawal text-white">Student Management</h1>
                <p className="text-zinc-400 font-tajawal">Surgical control center for all student accounts.</p>
            </div>

            <Suspense fallback={<div className="text-white">Loading directory...</div>}>
                <StudentTable data={students} />
            </Suspense>
        </div>
    );
}

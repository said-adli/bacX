import { getStudents } from "@/actions/admin-student-actions";
import { StudentsTable } from "@/components/admin/students/StudentsTable";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";

export const metadata = {
    title: "Admin - Student Management",
};

interface SearchParams {
    q?: string;
    page?: string;
    filter?: 'all' | 'active' | 'banned' | 'vip';
}

export default async function StudentsPage(props: { searchParamsPromise: Promise<SearchParams> }) {
    const params = await props.searchParamsPromise;

    const query = params.q || "";
    const page = Number(params.page) || 1;
    const filter = params.filter || "all";

    // Data Fetching
    let data;
    try {
        data = await getStudents({
            query,
            page,
            statusFilter: filter
        });
    } catch (error) {
        return (
            <AdminEmptyState
                title="Error Fetching Data"
                description="Could not load student list. Please try again."
                icon="error"
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Students</h1>
                    <p className="text-gray-400">Manage user accounts and subscriptions</p>
                </div>

                {/* We can put filter controls here later which update URL params */}
            </div>

            <StudentsTable
                initialStudents={data.students}
                totalCount={data.totalCount}
            />
        </div>
    );
}

import { getContentHierarchy } from "@/actions/admin-content-actions";
import { SubjectCard } from "@/components/admin/content/ContentComponents";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { Plus } from "lucide-react";

export const metadata = {
    title: "Admin - Content",
};

export default async function ContentPage() {
    const { subjects } = await getContentHierarchy();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Ultimate CMS</h1>
                    <p className="text-gray-400">Manage courses, units, and lessons</p>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all">
                    <Plus className="h-4 w-4" />
                    New Subject
                </button>
            </div>

            {subjects.length === 0 ? (
                <AdminEmptyState
                    title="No Content Libraries"
                    description="Get started by creating your first Subject."
                    icon="layout"
                />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {subjects.map(subject => (
                        <SubjectCard key={subject.id} subject={subject} />
                    ))}
                </div>
            )}
        </div>
    );
}

import { Metadata } from "next";
import { getDashboardSubjects } from "@/services/dashboard.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubjectCards } from "@/components/dashboard/SubjectCards";

export const metadata: Metadata = {
    title: "المواد الدراسية",
};

export const dynamic = 'force-dynamic';

export default async function MaterialsPage() {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Fetch Data via Service Layer (Same as Dashboard)
    const subjects = await getDashboardSubjects(user.id);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-serif font-bold text-white tracking-wide">المواد الدراسية</h1>
                <p className="text-white/50 text-lg">اختر مادة للوصول إلى الدروس والتمارين</p>
            </div>

            {/* Dynamic Subject Cards - Props Passed from Server */}
            <SubjectCards initialSubjects={subjects} />
        </div>
    );
}

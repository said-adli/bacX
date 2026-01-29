"use client";

import { SubjectCards } from "@/components/dashboard/SubjectCards";

export default function MaterialsClient() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-serif font-bold text-white tracking-wide">المواد الدراسية</h1>
                <p className="text-white/50 text-lg">اختر مادة للوصول إلى الدروس والتمارين</p>
            </div>

            {/* Dynamic Subject Cards */}
            <SubjectCards />
        </div>
    );
}

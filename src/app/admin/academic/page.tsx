'use client';

import { GlassCard } from "@/components/ui/GlassCard";
import { BookOpen, Construction } from "lucide-react";

export default function AcademicPage() {
    return (
        <div className="p-8">
            <GlassCard className="p-12 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">المسار الدراسي</h1>
                <p className="text-white/50">هذه الصفحة قيد التطوير حالياً. سيتم إضافة إدارة المسارات الدراسية قريباً.</p>
            </GlassCard>
        </div>
    );
}

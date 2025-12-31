import { BookOpen, Calculator, FlaskConical, Languages, Microscope, Scale, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Subject metadata (icons/names only - counts come from database)
const subjectMeta = [
    { id: 'math', name: 'الرياضيات', icon: Calculator },
    { id: 'physics', name: 'الفيزياء', icon: FlaskConical },
    { id: 'science', name: 'العلوم الطبيعية', icon: Microscope },
    { id: 'arabic', name: 'الأدب العربي', icon: BookOpen },
    { id: 'languages', name: 'اللغات الأجنبية', icon: Languages },
    { id: 'philosophy', name: 'الفلسفة', icon: Scale },
];

async function getSubjectCounts() {
    const counts: Record<string, number> = {};

    try {
        await Promise.all(
            subjectMeta.map(async (subject) => {
                const q = query(
                    collection(db, "lessons"),
                    where("subject", "==", subject.id)
                );
                const snapshot = await getCountFromServer(q);
                counts[subject.id] = snapshot.data().count;
            })
        );
    } catch (error) {
        console.error("Failed to fetch subject counts:", error);
        // Return zeros - never fake data
        subjectMeta.forEach(s => counts[s.id] = 0);
    }

    return counts;
}

export default async function SubjectsPage() {
    const lessonCounts = await getSubjectCounts();

    // Calculate real totals
    const totalLessons = Object.values(lessonCounts).reduce((sum, count) => sum + count, 0);
    const subjectsWithContent = Object.values(lessonCounts).filter(c => c > 0).length;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                <Link href="/dashboard" className="hover:text-slate-600">الرئيسية</Link>
                <ChevronLeft className="w-3 h-3" />
                <span className="text-slate-700">المواد الدراسية</span>
            </div>

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">كتالوج المواد</h1>
                <p className="text-sm text-slate-500">اختر المادة للوصول إلى الدروس والتمارين</p>
            </header>

            {/* Subjects List */}
            <div className="panel">
                <div className="panel-header">
                    <span className="panel-title">المواد المتاحة</span>
                    <span className="text-xs text-slate-400">{subjectMeta.length} مادة</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {subjectMeta.map((subject) => {
                        const Icon = subject.icon;
                        const lessonsCount = lessonCounts[subject.id] || 0;
                        const hasContent = lessonsCount > 0;

                        return (
                            <Link
                                key={subject.id}
                                href={`/subject/${subject.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-slate-500" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-800">{subject.name}</h3>
                                        <span className={`badge ${hasContent ? 'badge-info' : 'badge-neutral'}`}>
                                            {hasContent ? 'متاح' : 'قريباً'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <span>
                                            {lessonsCount === 0
                                                ? 'لا توجد دروس بعد'
                                                : `${lessonsCount} درس`}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <ChevronLeft className="w-4 h-4 text-slate-300" />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Real Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="metric text-center">
                    <div className="metric-value text-xl">
                        {totalLessons === 0 ? 'قريباً' : totalLessons}
                    </div>
                    <div className="metric-label">إجمالي الدروس</div>
                </div>
                <div className="metric text-center">
                    <div className="metric-value text-xl">{subjectsWithContent}</div>
                    <div className="metric-label">مواد متاحة</div>
                </div>
            </div>
        </div>
    );
}


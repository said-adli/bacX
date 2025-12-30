import { BookOpen, Calculator, FlaskConical, Languages, Microscope, Scale } from "lucide-react";
import Link from "next/link";

const subjects = [
    { id: 'math', name: 'الرياضيات', icon: Calculator },
    { id: 'physics', name: 'الفيزياء', icon: FlaskConical },
    { id: 'science', name: 'العلوم الطبيعية', icon: Microscope },
    { id: 'arabic', name: 'الأدب العربي', icon: BookOpen },
    { id: 'languages', name: 'اللغات الأجنبية', icon: Languages },
    { id: 'philosophy', name: 'الفلسفة', icon: Scale },
];

export default function SubjectsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 text-slate-900 p-6 pb-24 font-tajawal direction-rtl">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white/80 backdrop-blur-md border border-blue-100/50 shadow-sm rounded-3xl p-8 mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-slate-900">المواد الدراسية</h1>
                    <p className="text-slate-600">اختر المادة لتصفح الدروس والتمارين</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/subject/${subject.name}`}
                            className="group p-6 rounded-2xl bg-white/50 border border-blue-100/30 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 backdrop-blur-sm transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <subject.icon className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-700 transition-colors">{subject.name}</h3>
                            <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                                تصفح جميع دروس {subject.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

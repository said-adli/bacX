import { BookOpen, Calculator, FlaskConical, Languages, Microscope, Scale } from "lucide-react";
import Link from "next/link";

const subjects = [
    { id: 'math', name: 'الرياضيات', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'physics', name: 'الفيزياء', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'science', name: 'العلوم الطبيعية', icon: Microscope, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'arabic', name: 'الأدب العربي', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'languages', name: 'اللغات الأجنبية', icon: Languages, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'philosophy', name: 'الفلسفة', icon: Scale, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

export default function SubjectsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-24 font-tajawal">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">المواد الدراسية</h1>
                <p className="text-zinc-400 mb-8">اختر المادة لتصفح الدروس والتمارين</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            href={`/lessons?filter=${subject.name}`}
                            className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all"
                        >
                            <div className={`w-12 h-12 rounded-xl ${subject.bg} ${subject.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <subject.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                            <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                تصفح جميع دروس {subject.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Book, Calculator, Atom, Dna, Globe, Languages, ChevronLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

// Map slugs to Icons manually since we store icon strings in DB
// Map slugs to Icons manually since we store icon strings in DB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
    math: Calculator,
    physics: Atom,
    science: Dna,
    philosophy: Book,
    english: Globe,
    french: Languages
};

export default async function SubjectsPage() {
    const supabase = await createClient();

    // Fetch Subjects
    const { data: subjects, error } = await supabase
        .from("subjects")
        .select("*")
        .order("order_index", { ascending: true });

    if (error) {
        console.error("Error fetching subjects:", error);
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-amiri mb-2">
                        المواد الدراسية
                    </h1>
                    <p className="text-gray-400 text-lg">
                        اختر المادة للوصول إلى الدروس والملخصات
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(subjects || []).map((subject) => {
                    const Icon = ICON_MAP[subject.slug] || Book;

                    return (
                        <Link key={subject.id} href={`/subject/${subject.slug}`}>
                            <GlassCard className="p-8 h-full group hover:bg-white/5 transition-all duration-300 border-white/5 hover:border-primary/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                                <div className="relative z-10">
                                    <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <Icon className="w-8 h-8" />
                                    </div>

                                    <h2 className="text-2xl font-bold mb-3">{subject.title}</h2>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                        {subject.description || "دروس شاملة وملخصات متميزة"}
                                    </p>

                                    <div className="flex items-center text-primary font-bold text-sm group-hover:gap-2 transition-all">
                                        <span>تصفح الدروس</span>
                                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

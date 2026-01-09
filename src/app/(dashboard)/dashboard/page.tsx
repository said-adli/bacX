"use client";

import { motion } from "framer-motion";
import { 
    Clock, 
    Target, 
    Award, 
    BookOpen, 
    PlayCircle, 
    CheckCircle2, 
    MoreVertical 
} from "lucide-react";

// ============================================================================
// BRAINY DASHBOARD V3 - THE SOUL OF KNOWLEDGE
// ============================================================================
// "إنَّ اللهَ يَقْذِفُ العِلْمَ فِي قَلْبِ مَنْ يُحِبُّ"
// Glassmorphic widgets + Arabic Calligraphy
// ============================================================================

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* 1. THE SOUL HEADER */}
            <header className="relative py-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h1 className="font-amiri text-4xl md:text-6xl lg:text-7xl leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        &quot;إنَّ اللهَ يَقْذِفُ العِلْمَ فِي قَلْبِ مَنْ يُحِبُّ&quot;
                    </h1>
                    <p className="mt-4 text-white/40 text-lg font-light tracking-wide">
                        مرحباً بك في محراب العلم، يا طالب المعرفة.
                    </p>
                </motion.div>
            </header>

            {/* 2. STATS CARDS (Legacy Restoration) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    label="نقاط المعرفة" 
                    value="2,450" 
                    icon={Award} 
                    color="text-yellow-400" 
                    bg="bg-yellow-400/10"
                    trend="+150 اليوم"
                />
                <StatCard 
                    label="سلسلة النجاح" 
                    value="12 يوم" 
                    icon={Target} 
                    color="text-rose-400" 
                    bg="bg-rose-400/10"
                    trend="حافظ عليها!"
                />
                <StatCard 
                    label="ساعات التعلم" 
                    value="48.5" 
                    icon={Clock} 
                    color="text-blue-400" 
                    bg="bg-blue-400/10"
                    trend="ممتاز"
                />
            </section>

            {/* 3. MAIN CONTENT GRID (Recent & Tasks) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Column: Recent Activity (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <PlayCircle className="text-emerald-500" />
                            استأنف التعلم
                        </h2>
                        <button className="text-sm text-white/50 hover:text-white transition-colors">عرض الكل</button>
                    </div>

                    <div className="space-y-4">
                        <LessonCard 
                            title="الدوال الأسية واللوغاريتمية - الجزء 3"
                            subject="الرياضيات"
                            progress={75}
                            image="/thumbnails/math-1.jpg" // Placeholder or use gradient
                        />
                        <LessonCard 
                            title="الميكانيك: قوانين نيوتن"
                            subject="الفيزياء"
                            progress={30}
                            image="/thumbnails/physics-1.jpg"
                        />
                         <LessonCard 
                            title="Unit 3: Ethics in Business"
                            subject="الإنجليزية"
                            progress={0}
                            image="/thumbnails/eng-1.jpg"
                        />
                    </div>
                </div>

                {/* Left Column: Tasks / Widgets (1/3 width) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" />
                            مهامي
                        </h2>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-4">
                        <TaskItem label="حل تمرين الرياضيات 12 ص 45" done={true} />
                        <TaskItem label="مراجعة درس الفلسفة" done={false} />
                        <TaskItem label="تحضير أسئلة الفيزياء" done={false} />
                        
                        <button className="w-full py-3 mt-4 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm">
                            + إضافة مهمة جديدة
                        </button>
                    </div>

                    {/* Quick Motivation Widget */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-xl border border-white/5 rounded-3xl p-6 text-center">
                        <h3 className="font-bold text-lg mb-2">نصيحة اليوم</h3>
                        <p className="text-sm text-white/60">"النجاح هو حصيلة مجهودات صغيرة تتكرر كل يوم."</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

// --- COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, bg, trend }: any) {
    return (
        <div className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden">
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
                    <h3 className="text-3xl font-bold font-sans tracking-tight">{value}</h3>
                    <p className={`text-xs mt-2 font-medium ${color} bg-black/20 inline-block px-2 py-1 rounded-lg`}>{trend}</p>
                </div>
                <div className={`p-3 rounded-2xl ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
            {/* Hover Glow */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${bg} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
    );
}

function LessonCard({ title, subject, progress }: any) {
    return (
        <div className="group flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer">
            {/* Thumbnail Placeholder */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0 flex items-center justify-center text-white/20">
                <PlayCircle />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{subject}</span>
                    <button className="text-white/30 hover:text-white"><MoreVertical size={16} /></button>
                </div>
                <h4 className="font-bold text-lg truncate group-hover:text-emerald-400 transition-colors">{title}</h4>
                
                {/* Progress Bar */}
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs text-white/40 font-mono">{progress}%</span>
                </div>
            </div>
        </div>
    );
}

function TaskItem({ label, done }: any) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-emerald-500'}`}>
                {done && <CheckCircle2 size={12} className="text-black" />}
            </div>
            <span className={`flex-1 text-sm ${done ? 'text-white/30 line-through' : 'text-white/80'}`}>{label}</span>
        </div>
    );
}

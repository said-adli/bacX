"use client";

import { motion } from "framer-motion";
import {
    Play, BookOpen, Calendar, Clock, Star,
    ChevronLeft, Sparkles, Trophy, Flame
} from "lucide-react";
import Link from 'next/link';

// Animation Variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

export default function DashboardPage() {
    const subjects = [
        { title: "الرياضيات", level: "المستوى: متقدم", progress: 75, color: "from-blue-600 to-blue-900" },
        { title: "الفيزياء", level: "المستوى: متوسط", progress: 45, color: "from-purple-600 to-purple-900" },
        { title: "العلوم", level: "المستوى: بداية", progress: 10, color: "from-emerald-600 to-emerald-900" },
        { title: "الفلسفة", level: "المستوى: متقدم", progress: 90, color: "from-rose-600 to-rose-900" },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-12 pb-32"
        >

            {/* 1. CINEMATIC HERO BANNER */}
            <motion.section
                variants={item}
                className="relative h-[400px] w-full rounded-[40px] overflow-hidden group"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gold/5 mix-blend-overlay"></div>

                <div className="absolute bottom-0 left-0 w-full p-10 md:p-16 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 mb-4 text-gold"
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="uppercase tracking-[0.2em] text-sm font-medium">Daily Inspiration</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight max-w-2xl drop-shadow-2xl">
                            "العلم نورٌ يقذفه الله <br /> <span className="text-gold italic">في قلب من يشاء"</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <button className="glass-card px-8 py-4 flex items-center gap-3 text-white hover:bg-white/10">
                            <Play className="w-5 h-5 fill-white" />
                            <span>استرخي (Focus Mode)</span>
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* 2. THE NEON TIMELINE */}
            <motion.section variants={item} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 glass-card p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-gold" />
                            الطريق إلى البكالوريا
                        </h2>
                        <span className="text-gold font-mono text-xl">154 يوم</span>
                    </div>

                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        {/* Glowing Progress Line */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "45%" }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="absolute top-0 left-0 h-full bg-gold shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                        />
                    </div>

                    <div className="mt-6 flex justify-between text-sm text-white/40 font-mono">
                        <span>البداية</span>
                        <span className="text-gold">أنت هنا (45%)</span>
                        <span>الهدف</span>
                    </div>
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none"></div>
                    <Flame className="w-10 h-10 text-orange-500 mb-4 animate-pulse" />
                    <div className="text-4xl font-bold text-white mb-1">12</div>
                    <p className="text-white/50 text-sm">يوم حماسة متواصلة</p>
                </div>
            </motion.section>

            {/* 3. MOVIE POSTER SUBJECTS */}
            <motion.section variants={item}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif text-white">المواد الدراسية</h2>
                    <Link href="/subjects" className="text-white/50 hover:text-gold transition-colors flex items-center gap-2">
                        عرض الكل <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subjects.map((sub, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group relative aspect-[2/3] rounded-[30px] overflow-hidden cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${sub.color} mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity duration-500`}></div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                        <span className="text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-lg backdrop-blur-md">{sub.progress}% مكتمل</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1">{sub.title}</h3>
                                    <p className="text-white/70 text-sm">{sub.level}</p>
                                </div>
                            </div>

                            {/* Glossy sheen */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* 4. AGENDA & LIVE (Split Layout) */}
            <motion.section variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Now */}
                <div className="p-8 rounded-[40px] bg-gradient-to-br from-red-900/40 to-black border border-red-500/20 relative overflow-hidden group cursor-pointer hover:border-red-500/40 transition-colors">
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Live Now</span>
                    </div>

                    <div className="mt-12">
                        <h3 className="text-2xl font-bold text-white mb-2">مراجعة الدوال الأسية</h3>
                        <p className="text-white/60 mb-6">مع الأستاذ نور الدين • منذ 15 دقيقة</p>
                        <button className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-white" />
                            انضم للبث
                        </button>
                    </div>
                </div>

                {/* Next Up */}
                <div className="lg:col-span-2 glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gold" />
                        الأجندة القادمة
                    </h3>

                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-gold group-hover:bg-gold/10 transition-colors">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">حصـة الفلسفة - مقالة المقارنة</h4>
                                    <p className="text-white/40 text-sm">غداً • 18:00 - 20:00</p>
                                </div>
                                <div className="mr-auto">
                                    <ChevronLeft className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

        </motion.div>
    );
}

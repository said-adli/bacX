"use client";

import { motion } from "framer-motion";
import {
    Play, Calendar, Clock,
    ChevronLeft, Sparkles, Trophy, Flame,
    Calculator, Atom, Megaphone
} from "lucide-react";
import Link from 'next/link';
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import type { DashboardData } from "@/lib/data/dashboard";

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
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50 } }
};

interface DashboardViewProps {
    initialData: DashboardData;
}

export function DashboardView({ initialData }: DashboardViewProps) {
    const { announcement } = initialData;

    // Process announcement logic
    const isNewAnnouncement = announcement
        ? (Date.now() - announcement.createdAt.getTime()) / (1000 * 60 * 60) < 24
        : false;

    const announcementTime = announcement
        ? formatDistanceToNow(announcement.createdAt, { addSuffix: true, locale: ar })
        : "";

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-[1600px] mx-auto space-y-12 pb-40"
        >

            {/* 1. CINEMATIC HERO BANNER */}
            <motion.section
                variants={item}
                className="relative h-[480px] w-full rounded-[48px] overflow-hidden group shadow-2xl shadow-black/50"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[20s] ease-linear group-hover:scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>

                <div className="absolute bottom-0 left-0 w-full p-12 lg:p-20 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 mb-4 text-primary"
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="uppercase tracking-[0.2em] text-sm font-medium">Daily Inspiration</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight max-w-2xl drop-shadow-2xl">
                            &quot;العلم نورٌ يقذفه الله <br /> <span className="text-primary italic">في قلب من يشاء&quot;</span>
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
                <div className="lg:col-span-3 glass-card p-10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Trophy className="w-7 h-7 text-primary" />
                            الطريق إلى البكالوريا
                        </h2>
                        <span className="text-primary font-mono text-2xl font-bold">154 يوم</span>
                    </div>

                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                        {/* Glowing Progress Line — Electric Blue */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "45%" }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_20px_rgba(37,99,235,0.8)]"
                        />
                    </div>

                    <div className="mt-8 flex justify-between text-sm text-white/50 font-mono">
                        <span>البداية</span>
                        <span className="text-primary font-medium">أنت هنا (45%)</span>
                        <span>الهدف</span>
                    </div>
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none group-hover:from-purple-900/30 transition-colors"></div>
                    <Flame className="w-12 h-12 text-orange-500 mb-4 animate-pulse" />
                    <div className="text-5xl font-bold text-white mb-2">12</div>
                    <p className="text-white/70 text-sm font-medium">يوم حماسة متواصلة</p>
                </div>
            </motion.section>

            {/* 3. CINEMATIC DISCOVERY — Math, Physics & News */}
            <motion.section variants={item}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif text-white">المواد الأساسية</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* CARD 1: MATHEMATICS (The Architect) */}
                    <Link href="/subject/math" className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer shadow-2xl shadow-blue-900/10 hover:shadow-blue-600/20 transition-all duration-500 hover:scale-105 hover:ring-2 hover:ring-blue-500/50">
                        {/* Background: Geometric Deep Charcoal */}
                        <div className="absolute inset-0 bg-[#0B0C15]">
                            {/* Geometric Grid Pattern */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                            {/* Glowing Formula Effect */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] group-hover:bg-blue-600/30 transition-colors"></div>
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F] opacity-90"></div>

                        {/* Content */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                            <div className="self-end p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-colors">
                                <Calculator className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                            </div>

                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-3xl font-bold text-white mb-2 font-serif">الرياضيات</h3>
                                <p className="text-white/60 text-sm leading-relaxed">لغة الكون. تفاضل، تكامل، وهندسة الفضاء.</p>
                            </div>
                        </div>
                    </Link>

                    {/* CARD 2: PHYSICS (The Quantum) */}
                    <Link href="/subject/physics" className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer shadow-2xl shadow-purple-900/10 hover:shadow-purple-600/20 transition-all duration-500 hover:scale-105 hover:ring-2 hover:ring-purple-500/50">
                        {/* Background: Cinematic Space */}
                        <div className="absolute inset-0 bg-[#080514]">
                            {/* Light Trails / Stars */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)]"></div>
                            {/* Subtle Mesh */}
                            <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F] opacity-90"></div>

                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                            <div className="self-end p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-purple-600/20 group-hover:border-purple-500/30 transition-colors">
                                <Atom className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
                            </div>

                            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-3xl font-bold text-white mb-2 font-serif">الفيزياء</h3>
                                <p className="text-white/60 text-sm leading-relaxed">قوانين الطبيعة. ميكانيك، طاقة، ونووي.</p>
                            </div>
                        </div>
                    </Link>

                    {/* CARD 3: ANNOUNCEMENTS (The Voice) */}
                    <div className="group relative aspect-[3/4] rounded-[40px] overflow-hidden cursor-pointer shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 hover:ring-2 hover:ring-blue-400/50">
                        {/* Background: Electric Blue Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-black group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                        <div className="absolute inset-0 p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-auto">
                                <div className="p-3 rounded-2xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30">
                                    <Megaphone className="w-8 h-8 text-blue-300" />
                                </div>
                                {isNewAnnouncement && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-3">آخر الإعلانات</h3>
                                <p className="text-white/90 text-lg font-medium leading-relaxed font-serif">
                                    {announcement ? `"${announcement.content}"` : "لا توجد إعلانات جديدة حالياً."}
                                </p>
                                {announcement && (
                                    <p className="text-blue-300 text-xs mt-4 font-mono">
                                        تم النشر: {announcementTime}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </motion.section>

            {/* 4. AGENDA & LIVE (Split Layout) */}
            <motion.section variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Now */}
                <div className="p-10 rounded-[40px] bg-gradient-to-br from-red-900/40 to-black border border-red-500/20 relative overflow-hidden group cursor-pointer hover:border-red-500/40 transition-colors shadow-2xl shadow-red-900/20">
                    <div className="absolute top-8 right-8 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Live Now</span>
                    </div>

                    <div className="mt-16">
                        <h3 className="text-3xl font-bold text-white mb-3">مراجعة الدوال الأسية</h3>
                        <p className="text-white/60 mb-8 text-lg">مع الأستاذ نور الدين • منذ 15 دقيقة</p>
                        <button className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-3 text-lg shadow-lg shadow-red-600/20">
                            <Play className="w-5 h-5 fill-white" />
                            انضم للبث
                        </button>
                    </div>
                </div>

                {/* Next Up */}
                <div className="lg:col-span-2 glass-card p-10">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-primary" />
                        الأجندة القادمة
                    </h3>

                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-6 p-5 rounded-3xl hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-lg mb-1">حصـة الفلسفة - مقالة المقارنة</h4>
                                    <p className="text-white/70 text-sm font-medium">غداً • 18:00 - 20:00</p>
                                </div>
                                <div className="mr-auto">
                                    <ChevronLeft className="w-6 h-6 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

        </motion.div>
    );
}

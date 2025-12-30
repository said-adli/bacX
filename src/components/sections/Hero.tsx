"use client";

import Link from "next/link";
// import Image from "next/image";
import { ArrowLeft, PlayCircle, Star } from "lucide-react";

import { ArrowLeft, PlayCircle, Star } from "lucide-react";

interface HeroProps {
    stats?: {
        usersCount: number;
        lessonsCount: number;
    }
}

export function Hero({ stats }: HeroProps) {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
                {/* Text Content */}
                <div className="flex-1 text-center md:text-right space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        المنصة الأولى لطلاب البكالوريا في الجزائر
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.2]">
                        حقّق حلم <span className="text-primary">البكالوريا</span>
                        <br />
                        بامتياز وتفوق.
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        انضم إلى نخبة الطلاب واحصل على أفضل الدروس، التمارين، والمراجعات الشاملة مع أساتذة خبراء. رحلتك نحو النجاح تبدأ هنا.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                        <Link
                            href="/auth?mode=signup"
                            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
                        >
                            ابدأ رحلتك مجاناً
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-foreground border border-input rounded-xl font-bold text-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-2"
                        >
                            <PlayCircle className="w-5 h-5 text-primary" />
                            شاهد كيف نعمل
                        </Link>
                    </div>

                    <div className="pt-6 flex items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 space-x-reverse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                        <div className="w-full h-full bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                            <span className="font-medium">+{stats?.usersCount ? stats.usersCount.toLocaleString() : "5,000"} طالب يثقون بنا</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-foreground">4.9/5</span>
                        </div>
                    </div>
                </div>

                {/* Hero Image/Visual */}
                <div className="flex-1 w-full max-w-xl relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/50 backdrop-blur-sm aspect-video sm:aspect-square md:aspect-[4/3]">
                        {/* Placeholder for Hero Image - using a gradient/pattern for now if image missing */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                    <PlayCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">تجربة تعليمية سينمائية</h3>
                                <p className="text-muted-foreground mt-2">محتوى عالي الجودة بدقة 4K</p>
                            </div>
                        </div>
                        {/* If an image exists, we would use it here. Keeping placeholder for safety as requested "use generate_image if needed" but I'll stick to CSS for speed unless requested */}
                    </div>

                    {/* Floating Cards */}
                    <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-border animate-bounce duration-[3000ms]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">نتائج مبهرة</div>
                                <div className="text-xs text-muted-foreground">98% نسبة النجاح</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

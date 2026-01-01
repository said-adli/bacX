"use client";

import Link from "next/link";
import { ArrowLeft, Check, Play, Star, Sparkles, BookOpen, Crown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="bg-background min-h-screen selection:bg-primary/30 overflow-hidden">

      {/* 1. HERO SECTION (The Masterpiece) */}
      <motion.section
        className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden mesh-bg"
        style={{ y: yHero, opacity: opacityHero }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

        {/* Animated Floating Elements — Electric Blue */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-accent/15 rounded-full blur-[120px]"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary/80 text-sm tracking-[0.2em] font-medium uppercase">Baccalaureate 2025</span>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-2xl">
            منصة <span className="text-gradient-blue">التفوق</span> <br />
            الأكاديمي
          </h1>

          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12 font-light leading-relaxed font-sans">
            رحلة سينمائية نحو النجاح، مصممة للنخبة الطموحة.
            محتوى تعليمي يتجاوز التوقعات.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth?mode=signup" className="group relative px-8 py-4 bg-primary rounded-[40px] text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-glow">
              <span className="relative z-10 flex items-center gap-2">
                ابدأ رحلتك مجاناً
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>

            <Link href="#masterclass" className="group flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-md rounded-[40px] text-white/90 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all">
              <Play className="w-5 h-5 fill-current" />
              <span>شاهد العرض</span>
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-xs uppercase tracking-widest">اكتشف المزيد</span>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>
        </motion.div>
      </motion.section>

      {/* 2. THE MASTERCLASS EXPERIENCES (Parallax Cards) */}
      <section id="masterclass" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">تجربة تعليمية لا مثيل لها</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "جودة سينمائية", desc: "دروس بدقة 4K مع مونتاج احترافي يسهل الفهم.", icon: Play, delay: 0 },
              { title: "نخبة الأساتذة", desc: "تعلم من أفضل المصححين والأساتذة في الجزائر.", icon: Star, delay: 0.2 },
              { title: "منهجية دقيقة", desc: "محتوى منظم يتوافق تماماً مع التدرج السنوي.", icon: BookOpen, delay: 0.4 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.8 }}
                className="glass-card p-10 flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <item.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRICING (The Prestige) */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/10 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Crown className="w-64 h-64 text-primary rotate-12" />
            </div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">استثمر في مستقبلك</h2>
              <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
                احصل على وصول كامل لجميع الدروس، الملخصات، والحصص المباشرة.
                انضم إلى النخبة اليوم.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/auth?mode=signup" className="w-full sm:w-auto px-10 py-5 bg-primary rounded-[40px] text-white font-bold text-xl hover:scale-105 transition-transform shadow-glow">
                  اشتراك سنوي (15,000 دج)
                </Link>
                <Link href="/pricing" className="text-white/80 hover:text-primary transition-colors underline underline-offset-8">
                  عرض بـاقي الخطط
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 text-white/50 text-sm">
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> ضمان استرجاع الأموال</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> دعم فني 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-white/30 border-t border-white/5">
        <p>&copy; 2025 Brainy. Crafted for Excellence.</p>
      </footer>
    </div>
  );
}

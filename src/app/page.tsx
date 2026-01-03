"use client";

import Link from "next/link";
import { Check, Play, Star, BookOpen, Crown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BrainyLogo } from "@/components/ui/BrainyLogo";
import { HeroSection } from "@/components/sections/HeroSection";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Scroll listener for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="bg-background min-h-screen selection:bg-primary/30 overflow-hidden">

      {/* HEADER / NAVIGATION (Anti-Band Fixed & Transparent) */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500",
          isScrolled ? "bg-[#0A0A0F]/70 backdrop-blur-lg border-b border-white/5 py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

          {/* Right Side: Luxury Brand (Imprinted + Soul) */}
          <div className="relative group select-none flex items-center gap-6 z-20">
            {/* Removed background glow for true transparency */}
            <div className="relative flex items-center gap-4">
              <BrainyLogo variant="icon" className="h-[4.5rem] w-[4.5rem] drop-shadow-lg" />
              <span className="text-4xl md:text-5xl font-cinzel text-[#F5E6D3] tracking-[0.05em] drop-shadow-md pt-1">
                Brainy
              </span>
            </div>
          </div>

          {/* Left Side: Minimal Login Button */}
          <Link href="/auth?mode=login" className="relative px-6 py-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-all text-xs uppercase tracking-widest font-medium group overflow-hidden bg-white/5 hover:bg-white/10">
            <span className="relative z-10 font-cinzel text-xs font-bold">Log In</span>
          </Link>
        </div>
      </motion.header>

      {/* 1. HERO SECTION (The Masterpiece) */}
      <HeroSection style={{ y: yHero, opacity: opacityHero }} />

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
                <Link href="/auth?mode=signup" className="w-full sm:w-auto px-10 py-5 bg-primary rounded-[40px] text-white font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]">
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
        <p>&copy; 2026 Brainy. Crafted for Excellence.</p>
      </footer>
    </div>
  );
}

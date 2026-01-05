"use client";

import Link from "next/link";
import { Check, X, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { NeuralBackground } from "@/components/ui/NeuralBackground";
import { cn } from "@/lib/utils";

// --- Data ---
const pricingTiers = [
    {
        id: "free",
        name: "الباقة المجانية",
        price: "0",
        description: "كل ما تحتاجه للبدء في رحلة التفوق.",
        features: [
            "الوصول لملخصات جميع الوحدات",
            "5 تمارين محلولة شهرياً",
            "مشاهدة دقيقة واحدة من كل درس فيديو",
            "منتدى النقاش العام"
        ],
        notIncluded: [
            "دروس الفيديو الكاملة (4K)",
            "الحصص المباشرة",
            "المصحح الذكي (AI)",
            "تحميل ملفات PDF"
        ],
        cta: "ابدأ مجاناً",
        href: "/auth/signup",
        popular: false,
    },
    {
        id: "pro",
        name: "باقة التفوق (Pro)",
        price: "15,000",
        period: "/ سنة",
        description: "الخيار الأمثل للتلميذ الطموح. استثمار يضمن مستقبلك.",
        features: [
            "وصول غير محدود لجميع الدروس (فيديو 4K)",
            "مكتبة التمارين الكاملة (+2000 تمرين)",
            "حضور الحصص المباشرة أسبوعياً",
            "المصحح الذكي (AI) - تصحيح فوري",
            "تحميل جميع الملفات (PDF)",
            "أولوية في الرد على الأسئلة"
        ],
        notIncluded: [],
        cta: "اشترك الآن",
        href: "/auth/signup",
        popular: true,
    },
    {
        id: "school",
        name: "للمدارس والمؤسسات",
        price: "تواصل معنا",
        description: "حلول مخصصة للمدارس الخاصة والجمعيات التعليمية.",
        features: [
            "حسابات متعددة للتلاميذ",
            "لوحة تحكم للمعلمين والأولياء",
            "تقارير أداء مفصلة للقسم",
            "دعم فني مخصص",
            "تدريب وتكوين للطاقم"
        ],
        notIncluded: [],
        cta: "تواصل معنا",
        href: "mailto:contact@brainy.dz",
        popular: false,
        isCustom: true
    }
];

const faqs = [
    {
        q: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
        a: "بما أن الاشتراك سنوي ويدفع مرة واحدة، لا يوجد تجديد تلقائي ولا حاجة للإلغاء. أنت تدفع مرة واحدة وتستفيد طوال السنة الدراسية."
    },
    {
        q: "هل يمكنني استرجاع أموالي؟",
        a: "نعم، نقدم ضمان استرجاع الأموال خلال 7 أيام من الاشتراك في حال لم تعجبك المنصة أو واجهت مشاكل تقنية لا يمكن حلها."
    },
    {
        q: "هل تشمل الباقة جميع المواد؟",
        a: "نعم، اشتراك 'باقة التفوق' يشمل جميع المواد الأساسية والثانوية (رياضيات، فيزياء، علوم، فلسفة، لغات...) للشعب العلمية والتقنية."
    },
    {
        q: "كيف يتم الدفع؟",
        a: "ندعم الدفع عبر البطاقة الذهبية (CIB/Edahabia) أو عبر بريد الجزائر (CCP). عملية التفعيل فورية عند الدفع الإلكتروني."
    }
];

export default function PricingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
            <NeuralBackground />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#0A0A0F]/50 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Logo />
                    <div className="flex items-center gap-4">
                        <Link href="/auth?mode=login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">
                            تسجيل الدخول
                        </Link>
                        <Link href="/auth?mode=signup" className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/5">
                            ابدأ الآن
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <Sparkles className="w-3 h-3" />
                        <span>استثمار ذكي لمستقبل مشرق</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight"
                    >
                        خطط أسعار <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">بسيطة وشفافة</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/60 leading-relaxed"
                    >
                        اختر الباقة التي تناسب احتياجاتك. لا تكاليف مخفية، ادفع مرة واحدة واستمتع بتجربة تعليمية متكاملة طوال العام الدراسي.
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 relative">
                    {/* Background Glow for popular card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={cn(
                                "relative h-full flex flex-col p-8 rounded-3xl border transition-all duration-300 group",
                                tier.popular
                                    ? "bg-white/5 border-primary/50 shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] scale-100 md:scale-105 z-10"
                                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                            )}>
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg border border-primary/50">
                                        الأكثر طلباً
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-4xl font-serif font-bold text-white">{tier.price}</span>
                                        {tier.price !== '0' && !tier.isCustom && <span className="text-sm text-white/50">دج</span>}
                                        {tier.period && <span className="text-sm text-white/50">{tier.period}</span>}
                                    </div>
                                    <p className="text-sm text-white/60 leading-relaxed min-h-[40px]">{tier.description}</p>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-white/80">
                                            <div className="mt-1 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-primary" />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {tier.notIncluded.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-white/30">
                                            <div className="mt-1 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                <X className="w-2.5 h-2.5" />
                                            </div>
                                            <span className="line-through decoration-white/30">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href={tier.href}
                                    className={cn(
                                        "w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-300",
                                        tier.popular
                                            ? "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
                                    )}
                                >
                                    {tier.cta}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">أسئلة شائعة</h2>
                        <p className="text-white/50">كل ما تريد معرفته عن الاشتراكات</p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-panel overflow-hidden rounded-2xl border border-white/5"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-right hover:bg-white/5 transition-colors"
                                >
                                    <span className="font-medium text-white">{faq.q}</span>
                                    <ChevronDown className={cn("w-5 h-5 text-white/50 transition-transform duration-300", openFaq === idx ? "rotate-180" : "")} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-6 text-sm text-white/60 leading-relaxed border-t border-white/5 pt-4">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-32 text-center">
                    <p className="text-white/40 text-sm mb-4">هل لديك استفسار آخر؟</p>
                    <a href="mailto:support@brainy.dz" className="text-primary hover:text-primary-hover underline underline-offset-4 transition-colors">
                        تواصل مع فريق الدعم
                    </a>
                </div>

            </main>
        </div>
    );
}

"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "الباقة المجانية",
        price: "0",
        period: "دج",
        description: "جرب المنصة واكتشف جودة المحتوى",
        features: [
            "الوصول للدروس الأولى من كل مادة",
            "جودة فيديو عالية HD",
            "ملفات PDF للدروس المجانية",
            "دعم فني محدود"
        ],
        cta: "ابدأ مجاناً",
        href: "/auth?mode=signup",
        popular: false
    },
    {
        name: "باقة النجاح (شهري)",
        price: "2500",
        period: "دج / شهر",
        description: "مرونة كاملة للتحضير الشهري",
        features: [
            "الوصول لجميع المواد والدروس",
            "بثوث مباشرة أسبوعية",
            "تمارين ومواضيع محلولة",
            "مجموعة تيليجرام VIP",
            "دعم فني 7/7"
        ],
        cta: "اشترك الآن",
        href: "/subscribe?plan=monthly",
        popular: false
    },
    {
        name: "باقة الامتياز (سنوي)",
        price: "15000",
        period: "دج / سنة",
        description: "وفر أكثر واضمن تحضيرك للعام كامل",
        features: [
            "كل مميزات الاستراك الشهري",
            "توفير شهرين مجاناً",
            "مراجعة نهائية شاملة مجاناً",
            "أولوية في طرح الأسئلة",
            "جلسات توجيهية خاصة"
        ],
        cta: "الأكثر طلباً",
        href: "/subscribe?plan=yearly",
        popular: true
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-background border-t border-border">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        خطط أسعار تناسب الجميع
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        استثمر في مستقبلك اليوم بأفضل الأسعار.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative p-8 rounded-3xl border flex flex-col",
                                plan.popular
                                    ? "bg-background border-blue-500 shadow-2xl scale-105 z-10"
                                    : "bg-background border-border shadow-sm hover:shadow-lg transition-shadow"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    الأكثر مبيعاً
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.href}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold text-center transition-all",
                                    plan.popular
                                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-600/25"
                                        : "bg-muted text-foreground hover:bg-muted/80"
                                )}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

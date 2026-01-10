import { Check } from "lucide-react";

export default function SubscriptionPage() {
    const plans = [
        {
            name: "البداية",
            price: "مجاني",
            period: "مدى الحياة",
            features: ["الوصول للمواد المجانية", "اختبارات تجريبية محدودة", "دعم فني عبر البريد"],
            cta: "ابدأ الآن",
            featured: false,
        },
        {
            name: "المتفوق",
            price: "199",
            period: "درهم / شهر",
            features: ["جميع المواد الدراسية", "حصص مباشرة أسبوعية", "تصحيح الفروض والامتحانات", "مجموعة واتساب خاصة"],
            cta: "اشترك الآن",
            featured: true,
        },
        {
            name: "النخبة",
            price: "1500",
            period: "درهم / سنة",
            features: ["كل مميزات المتفوق", "توجيه أكاديمي شخصي", "حصص دعم فردية", "ضمان استرجاع الأموال"],
            cta: "تواصل معنا",
            featured: false,
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-serif font-bold text-white">خطط الاشتراك</h1>
                <p className="text-white/60 max-w-2xl mx-auto">
                    اختر الخطة التي تناسب طموحك. استثمر في مستقبلك الدراسي مع أفضل الأساتذة والأدوات التعليمية.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`relative p-8 rounded-3xl border flex flex-col gap-6 transition-all duration-300
              ${plan.featured
                                ? "bg-white/10 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105 z-10"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }
            `}
                    >
                        {plan.featured && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                الأكثر طلباً
                            </div>
                        )}

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-4xl font-bold font-serif">{plan.price}</span>
                                <span className="text-sm text-white/40">{plan.period}</span>
                            </div>
                        </div>

                        <ul className="space-y-4 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-white/80">
                                    <Check className="w-5 h-5 text-blue-400" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-3 rounded-xl font-bold transition-all
                  ${plan.featured
                                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                                    : "bg-white/10 hover:bg-white/20 text-white"
                                }
                `}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

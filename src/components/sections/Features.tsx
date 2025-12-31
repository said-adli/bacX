"use client";

import { Video, BookOpen, Users, Trophy, Zap, Shield } from "lucide-react";

const features = [
    {
        icon: Video,
        title: "جودة تصوير سينمائية",
        description: "دروس مصورة بأحدث التقنيات وبدقة 4K لتجربة مشاهدة ممتعة وواضحة."
    },
    {
        icon: Users,
        title: "أساتذة نخبة النخبة",
        description: "تعلم على يد أفضل الأساتذة المصححين للبكالوريا في الجزائر."
    },
    {
        icon: BookOpen,
        title: "محتوى شامل ومنظم",
        description: "دروس، ملخصات، وتمارين محلولة منظمة حسب البرنامج الوزاري الجديد."
    },
    {
        icon: Trophy,
        title: "منهجية الإجابة النموذجية",
        description: "تعلم كيفية الإجابة بدقة للحصول على العلامة الكاملة في الامتحانات."
    },
    {
        icon: Zap,
        title: "منصة سريعة وتفاعلية",
        description: "تجربة مستخدم سلسة وسريعة على جميع الأجهزة."
    },
    {
        icon: Shield,
        title: "محتوى حصري ومحمي",
        description: "بيئة تعليمية آمنة وخالية من التشتت."
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        لماذا تختار <span className="text-primary">Brainy</span>؟
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        نقدم لك كل ما تحتاجه للتميز في البكالوريا في مكان واحد.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="p-8 rounded-2xl bg-muted/30 border border-border hover:border-primary/50 transition-colors hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

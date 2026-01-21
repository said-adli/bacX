"use client";

import { motion } from "framer-motion";
import { Play, Star, BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function MasterclassSection() {
    return (
        <section id="masterclass" className="py-32 px-6 relative z-10" style={{ contentVisibility: 'auto' }}>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">تجربة Brainy التعليمية</h2>
                    <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: "جودة سينمائية 4K", desc: "استمتع بدروس مصورة بأعلى معايير الجودة العالمية.", icon: Play, delay: 0 },
                        { title: "نخبة الأساتذة", desc: "تعلم على يد أفضل الكفاءات التعليمية في الجزائر.", icon: Star, delay: 0.2 },
                        { title: "منهجية Brainy", desc: "نظام تعليمي متكامل يضمن لك التفوق في البكالوريا.", icon: BookOpen, delay: 0.4 },
                    ].map((item, i) => (
                        <GlassCard
                            key={i}
                            className="p-10 flex flex-col items-center text-center group cursor-pointer border-white/5 hover:border-primary/20 transition-all duration-500 will-change-transform"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: item.delay, duration: 0.8 }}
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 mx-auto transform-gpu translate-z-0">
                                    <item.icon className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-white/60 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
}

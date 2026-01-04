"use client";

import { motion } from "framer-motion";
import { Play, Star, BookOpen } from "lucide-react";

export function MasterclassSection() {
    return (
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
    );
}

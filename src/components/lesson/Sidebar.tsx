"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { MessageSquare, BookOpen, Send, CheckCircle2, Lock, FileQuestion } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const [activeTab, setActiveTab] = useState<'chat' | 'syllabus'>('chat');
    const { user, role } = useAuth();
    const router = useRouter();

    // Determine if user has access (Admin or Subscribed)
    // NOTE: In a real app, 'isSubscribed' would be a direct property of the User object context or fetched
    // We assume the context populates user.isSubscribed as discussed in previous steps
    const hasAccess = role === 'admin' || (user as { isSubscribed?: boolean } | null)?.isSubscribed;

    const handleItemClick = (i: number) => {
        // Allow first lesson as Free Sample
        if (i === 1) {
            toast.success("تم الانتقال للدرس (تجريبي)");
            return;
        }

        if (!hasAccess) {
            // Trigger shake (visual feedback handled by motion)
            toast.error("هذا الدرس متاح للمشتركين فقط", {
                icon: <Lock className="w-4 h-4" />,
                action: {
                    label: "اشتراك",
                    onClick: () => router.push('/subscription')
                }
            });
            return;
        }

        toast.success("تم الانتقال للدرس (تجريبي)");
    };

    const messages = [1, 2, 3];
    const syllabus = [1, 2, 3, 4, 5];

    return (
        <GlassCard className="h-[600px] flex flex-col overflow-hidden bg-surface/50 border-white/5">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                        "flex-1 py-4 text-sm font-tajawal font-medium transition-colors relative outline-none",
                        activeTab === 'chat' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>المحادثة المباشرة</span>
                    </div>
                    {activeTab === 'chat' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(41,151,255,0.5)]" />
                    )}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('syllabus')}
                    className={cn(
                        "flex-1 py-4 text-sm font-tajawal font-medium transition-colors relative outline-none",
                        activeTab === 'syllabus' ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>المنهج الدراسي</span>
                    </div>
                    {activeTab === 'syllabus' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(41,151,255,0.5)]" />
                    )}
                </motion.button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' ? (
                        messages.length > 0 ? (
                            <motion.div
                                key="messages-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {messages.map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex-shrink-0 border border-white/5" />
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs text-zinc-400 font-bold">أحمد محمد</span>
                                                <span className="text-[10px] text-zinc-600">10:3{i} AM</span>
                                            </div>
                                            <p className="text-sm text-zinc-300 bg-white/5 p-3 rounded-2xl rounded-tr-none mt-1 border border-white/5">
                                                يا أستاذ، هل هذه النقطة مقررة علينا في البكالوريا؟
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-chat"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center h-full text-zinc-600"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">لا توجد رسائل بعد</p>
                                <p className="text-xs opacity-50 mt-1">كن أول من يسأل!</p>
                            </motion.div>
                        )
                    ) : (
                        syllabus.length > 0 ? (
                            <motion.div
                                key="syllabus-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-2"
                            >
                                {syllabus.map((i) => {
                                    const isLocked = !hasAccess && i !== 1; // First lesson is free

                                    return (
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            whileHover={{ scale: 1.01 }}
                                            animate={isLocked ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                                            // Only shake if this specific item is clicked and valid shake key updates, 
                                            // but since we rely on state for shake, we can use a simpler approach:
                                            // We will just use layout animation. For 'shake' on click, we'd typically use a control.
                                            // For simplicity, we just add the visual lock here.
                                            key={i}
                                            onClick={() => handleItemClick(i)}
                                            className={cn(
                                                "p-3 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer transition-all duration-300 relative overflow-hidden",
                                                i === 1 ? "bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(41,151,255,0.1)]" : "hover:bg-white/5",
                                                isLocked && "opacity-75 hover:opacity-100"
                                            )}
                                        >
                                            {/* Glass Overlay for Locked Items */}
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-0 pointer-events-none" />
                                            )}

                                            <div className="flex items-center gap-3 relative z-10">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110",
                                                    i === 1 ? "bg-primary text-white" : "bg-zinc-800 text-zinc-500"
                                                )}>
                                                    {i}
                                                </div>
                                                <div>
                                                    <h4 className={cn("text-sm font-medium transition-colors", i === 1 ? "text-white" : "text-zinc-400 group-hover:text-zinc-300")}>
                                                        {i === 1 ? "درس تجريبي: الدوال الأسية" : "محتوى حصري للمشتركين"}
                                                    </h4>
                                                    <span className="text-xs text-zinc-600">45 دقيقة</span>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                {isLocked ? (
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-500/50 transition-colors">
                                                        <Lock className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                                                    </div>
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-syllabus"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center h-full text-zinc-600"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <FileQuestion className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">المنهج غير متوفر حالياً</p>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Input */}
            {activeTab === 'chat' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-t border-white/5 bg-black/20"
                >
                    <form className="relative" onSubmit={(e) => e.preventDefault()}>
                        <Input
                            placeholder="اكتب سؤالك هنا..."
                            className="pr-12 bg-zinc-900/50 border-zinc-800 focus:border-primary transition-all duration-300 focus:shadow-[0_0_20px_rgba(41,151,255,0.1)]"
                        />
                        <motion.button
                            whileTap={{ scale: 0.90, rotate: -10 }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </form>
                </motion.div>
            )}
        </GlassCard>
    );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlayCircle, Lock, Layout, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const [activeTab, setActiveTab] = useState<'syllabus' | 'chat'>('syllabus');
    const { user, role } = useAuth();
    const router = useRouter();

    const hasAccess = role === 'admin' || (user as { isSubscribed?: boolean } | null)?.isSubscribed;

    const handleItemClick = (i: number) => {
        if (i === 1) {
            toast.success("تم الانتقال للدرس (تجريبي)");
            return;
        }

        if (!hasAccess) {
            toast.error("هذا الدرس متاح للمشتركين فقط", {
                icon: <Lock className="w-4 h-4" />,
                action: {
                    label: "اشتراك",
                    onClick: () => router.push('/subscription')
                }
            });
            return;
        }

        toast.success("تم الانتقال للدرس");
    };

    const messages = [1, 2, 3];
    const syllabus = [1, 2, 3, 4, 5, 6, 7];

    return (
        <div className="h-[600px] flex flex-col overflow-hidden bg-card border border-border rounded-2xl shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30">
                <button
                    onClick={() => setActiveTab('syllabus')}
                    className={cn(
                        "flex-1 py-4 text-sm font-bold transition-all relative outline-none",
                        activeTab === 'syllabus' ? "text-primary bg-background shadow-sm" : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>الدروس القادمة</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                        "flex-1 py-4 text-sm font-bold transition-all relative outline-none",
                        activeTab === 'chat' ? "text-primary bg-background shadow-sm" : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <div className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>المناقشة</span>
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative bg-background">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' ? (
                        <motion.div
                            key="chat-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 space-y-4">
                                {messages.map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs text-foreground font-bold">أحمد محمد</span>
                                                <span className="text-[10px] text-muted-foreground">10:3{i} AM</span>
                                            </div>
                                            <p className="text-sm text-foreground bg-muted p-3 rounded-2xl rounded-tr-none mt-1 border border-border/50">
                                                يا أستاذ، هل هذه النقطة مقررة علينا في البكالوريا؟
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input Inside Tab */}
                            <div className="mt-4 pt-4 border-t border-border sticky bottom-0 bg-background">
                                <form className="relative" onSubmit={(e) => e.preventDefault()}>
                                    <Input
                                        placeholder="اكتب سؤالك هنا..."
                                        className="pr-12 bg-muted/30 border-input focus:border-primary focus:ring-primary/20"
                                    />
                                    <button
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="syllabus-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-2"
                        >
                            {syllabus.map((i) => {
                                const isLocked = !hasAccess && i !== 1;
                                const isActive = i === 1;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleItemClick(i)}
                                        className={cn(
                                            "p-3 rounded-xl border flex items-center justify-between group cursor-pointer transition-all duration-200",
                                            isActive
                                                ? "bg-primary/5 border-primary/20 hover:border-primary/40"
                                                : "bg-card border-border hover:border-primary/30 hover:shadow-sm",
                                            isLocked && "opacity-75 grayscale-[0.5]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105",
                                                isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                                            )}>
                                                {i}
                                            </div>
                                            <div>
                                                <h4 className={cn("text-sm font-bold transition-colors", isActive ? "text-primary" : "text-foreground")}>
                                                    {i === 1 ? "درس تجريبي: الدوال الأسية" : `الدرس ${i}`}
                                                </h4>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" /> 45 دقيقة
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            {isLocked ? (
                                                <Lock className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

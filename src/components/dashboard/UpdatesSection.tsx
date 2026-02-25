"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnnouncementDTO, ScheduleDTO } from "@/services/dashboard.service";
import { Calendar, Bell, ChevronRight, X, Clock } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { arMA } from "date-fns/locale";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UpdatesSectionProps {
    announcements: AnnouncementDTO[];
    schedules?: ScheduleDTO[];
}

export default function UpdatesSection({ announcements, schedules = [] }: UpdatesSectionProps) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDTO | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Mission: Real-Time Broadcast Engine
    useEffect(() => {
        const channel = supabase
            .channel("realtime-announcements")
            .on(
                "postgres_changes",
                {
                    event: "*", // INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "announcements",
                },
                () => {
                    // Refresh the Server Component to fetch fresh data from invalid cache
                    router.refresh();
                    toast.info("تحديث جديد في الإعلانات");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, supabase]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. SCHEDULE SECTION (Placeholder) */}
            <GlassCard className="p-0 border-white/5 relative overflow-hidden group min-h-[320px]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">المواعيد القادمة</h3>
                            <p className="text-xs text-white/40">جدول الحصص المباشرة</p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex flex-col h-[260px] overflow-y-auto custom-scrollbar">
                    {schedules.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                <Clock className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/40 text-sm max-w-[200px] leading-relaxed">
                                لا توجد مواعيد مبرمجة حالياً. سيتم نشر جدول الحصص المباشرة قريباً.
                            </p>
                        </div>
                    ) : (
                        schedules.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`w-full text-right p-4 hover:bg-white/5 transition-colors flex items-start gap-4 group ${idx !== schedules.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                {/* Date Box */}
                                <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-purple-500/20 text-center transition-colors">
                                    <span className="text-xs text-white/40 font-medium">
                                        {format(new Date(item.event_date), 'MMM', { locale: arMA })}
                                    </span>
                                    <span className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                                        {format(new Date(item.event_date), 'dd')}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 mt-1">
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                            {item.title}
                                        </h4>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/60 font-mono whitespace-nowrap">
                                            {format(new Date(item.event_date), 'HH:mm')}
                                        </span>
                                    </div>
                                    {item.description && (
                                        <p className="text-xs text-white/50 line-clamp-1 leading-relaxed">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>


            {/* 2. UPDATES SECTION (Interactive) */}
            <GlassCard className="p-0 border-white/5 relative overflow-hidden min-h-[320px]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <Bell size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">المستجدات</h3>
                            <p className="text-xs text-white/40">آخر الإعلانات والتحديثات</p>
                        </div>
                    </div>
                    {announcements.some(a => a.isNew) && (
                        <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/20 animate-pulse">
                            جديد
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex flex-col">
                    {announcements.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center h-[240px]">
                            <p className="text-white/30 text-sm">لا توجد إعلانات حالياً</p>
                        </div>
                    ) : (
                        announcements.map((item, idx) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedAnnouncement(item)}
                                className={`w-full text-right p-4 hover:bg-white/5 transition-colors flex items-start gap-4 group ${idx !== announcements.length - 1 ? 'border-b border-white/5' : ''
                                    }`}
                            >
                                {/* Date Box */}
                                <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 text-center">
                                    <span className="text-xs text-white/40 font-medium">
                                        {format(item.createdAt, 'MMM', { locale: arMA })}
                                    </span>
                                    <span className="text-lg font-bold text-white">
                                        {format(item.createdAt, 'dd')}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {item.title || "تحديث جديد"}
                                        </h4>
                                        {item.isNew && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>

                                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 mt-2 transition-colors" />
                            </button>
                        ))
                    )}
                </div>
            </GlassCard>

            {/* MODAL (Dialog) */}
            <Dialog.Root open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-full max-w-lg p-0 outline-none animate-in zoom-in-95 duration-200">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-white/5">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1">
                                            {selectedAnnouncement?.title}
                                        </h2>
                                        <p className="text-sm text-white/40">
                                            {selectedAnnouncement && format(selectedAnnouncement.createdAt, 'PPP', { locale: arMA })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="prose prose-invert prose-p:text-white/70 prose-headings:text-white leading-loose text-right" dir="rtl">
                                    <p className="text-lg whitespace-pre-wrap">
                                        {selectedAnnouncement?.content}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}

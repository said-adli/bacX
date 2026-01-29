"use client";

import { useState } from "react";
import {
    Video,
    Upload,
    Wifi,
    AlertTriangle,
    CheckCircle2,
    Copy,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Settings,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard"; // Assuming this exists based on previous context
import { toast } from "sonner";

export function ContentOperationsGuide() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'live' | 'upload'>('live');

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`تم نسخ ${label}`, {
            description: text
        });
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2">
            {/* Header / Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-white/10 rounded-xl transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Info size={20} />
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">دليل العمليات التقنية</h3>
                        <p className="text-xs text-white/40">إعدادات البث المباشر ورفع الفيديوهات</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className="text-white/40" /> : <ChevronDown className="text-white/40" />}
            </button>

            {/* Content Area */}
            {isOpen && (
                <div className="mt-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex p-1 bg-black/40 rounded-lg border border-white/5">
                        <button
                            onClick={() => setActiveTab('live')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                                activeTab === 'live'
                                    ? "bg-red-500/20 text-red-400 shadow-sm border border-red-500/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Wifi size={16} />
                            إعدادات البث المباشر
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                                activeTab === 'upload'
                                    ? "bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Upload size={16} />
                            رفع الدروس
                        </button>
                    </div>

                    <GlassCard className="p-6 bg-zinc-950/80 border-white/5">
                        {activeTab === 'live' ? (
                            <div className="space-y-8">
                                {/* YouTube Settings */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-red-400 mb-4 border-b border-white/5 pb-2">
                                        <Video size={20} />
                                        1. إعدادات YouTube Studio
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SettingItem
                                            label="الخصوصية (Privacy)"
                                            value="Unlisted (غير مدرج)"
                                            status="warning"
                                            note="مهم جداً حتى لا يظهر للعامة"
                                        />
                                        <SettingItem
                                            label="زمن الانتقال (Latency)"
                                            value="Ultra-low latency"
                                            status="critical"
                                            note="ضروري لتقليل التأخير لأقل من 5 ثواني"
                                        />
                                        <SettingItem
                                            label="DVR (التسجيل)"
                                            value="Enable"
                                            status="success"
                                            note="يسمح للطلاب بالرجوع للخلف"
                                        />
                                    </div>
                                </div>

                                {/* OBS Settings */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-blue-400 mb-4 border-b border-white/5 pb-2">
                                        <Settings size={20} />
                                        2. إعدادات OBS
                                    </h4>
                                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div>
                                                <span className="text-zinc-400 text-sm block mb-1">Keyframe Interval</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-mono font-bold">2 s</span>
                                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded border border-green-500/20">CRITICAL SYNC</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div>
                                                <span className="text-zinc-400 text-sm block mb-1">Bitrate</span>
                                                <span className="text-white font-mono font-bold">3500 Kbps</span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard("3500", "Bitrate")}
                                                className="p-2 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div>
                                                <span className="text-zinc-400 text-sm block mb-1">Output Mode</span>
                                                <span className="text-white font-mono font-bold">Advanced</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Steps */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                    <h5 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={16} />
                                        خطوات البدء الصحيحة
                                    </h5>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-100/80">
                                        <li>ابدأ البث في OBS أولاً (Start Streaming).</li>
                                        <li>انتظر ظهور "Excellent Connection" باللون الأخضر في يوتيوب.</li>
                                        <li>انسخ Video ID وضعه في لوحة التحكم هنا.</li>
                                        <li>اضغط "Go Live" في يوتيوب لبدء الحصه.</li>
                                    </ol>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Upload Config */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-lg font-bold text-purple-400 mb-4 border-b border-white/5 pb-2">
                                        <Upload size={20} />
                                        إعدادات رفع الفيديو
                                    </h4>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-4">
                                            <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h5 className="font-bold text-yellow-500 mb-1">تنبيه هام جداً</h5>
                                                <p className="text-sm text-yellow-200/80 leading-relaxed">
                                                    لا تجعل الفيديو <strong>Private (خاص)</strong> أبداً! <br />
                                                    الفيديوهات الخاصة لن تعمل على الموقع نهائياً. <br />
                                                    الحالة الصحيحة هي <strong>Unlisted (غير مدرج)</strong>.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <SettingItem
                                                label="Visibility (الظهور)"
                                                value="Unlisted"
                                                status="success"
                                                note="أي شخص لديه الرابط يمكنه المشاهدة"
                                            />
                                            <SettingItem
                                                label="Audience (الجمهور)"
                                                value="Not for kids"
                                                status="default"
                                                note="يمنع إغلاق المشغل المصغر"
                                            />
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <span className="text-zinc-400 text-sm block mb-3">Embedding Support</span>
                                            <div className="flex items-center gap-3 text-sm text-white/80">
                                                <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                                <p>تفعيل خيار <strong>Allow embedding</strong> من الإعدادات المتقدمة (Show More).</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ID Extraction */}
                                <div>
                                    <h4 className="text-md font-bold text-white mb-3">كيفية استخراج ID الفيديو</h4>
                                    <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm text-white/60 break-all border border-white/10">
                                        https://youtube.com/watch?v=<span className="text-green-400 font-bold bg-green-500/10 rounded px-1">dQw4w9WgXcQ</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-2">انسخ فقط الجزء الملون بالأخضر (11 خانة)</p>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

function SettingItem({ label, value, status = 'default', note }: { label: string, value: string, status?: 'default' | 'success' | 'warning' | 'critical', note?: string }) {
    const colors = {
        default: "bg-white/5 border-white/10 text-white",
        success: "bg-green-500/10 border-green-500/20 text-green-400",
        warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
        critical: "bg-red-500/10 border-red-500/20 text-red-400"
    };

    return (
        <div className={`p-3 rounded-lg border ${colors[status]}`}>
            <span className="text-xs opacity-70 block mb-1">{label}</span>
            <div className="font-bold text-lg">{value}</div>
            {note && <p className="text-[10px] opacity-60 mt-1 border-t border-white/5 pt-1">{note}</p>}
        </div>
    );
}

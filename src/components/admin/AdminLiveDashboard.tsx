"use client";

import { useState } from "react";
import { toggleLiveStream, archiveStream } from "@/actions/live";
import { useLiveStatus } from "@/hooks/useLiveStatus";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Radio, Archive, Loader2, Youtube } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLiveDashboard() {
    const { isLive, youtubeId: currentId, title: currentTitle } = useLiveStatus();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [youtubeId, setYoutubeId] = useState("");
    const [subject, setSubject] = useState("Physics");

    const handleGoLive = async () => {
        if (!title || !youtubeId) {
            toast.error("يرجى ملء جميع الحقول", { position: "top-center" });
            return;
        }

        setLoading(true);
        try {
            await toggleLiveStream({
                isLive: true,
                youtubeId,
                title,
                subject
            });
            toast.success("🔴 البث المباشر قيد التشغيل!", { position: "top-center" });
        } catch (e) {
            toast.error("حدث خطأ أثناء بدء البث");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEndAndArchive = async () => {
        setLoading(true);
        try {
            // Use current live data or fallback to form data if needed, 
            // mostly we trust the Hook data as 'Active Truth'.
            const idToArchive = currentId || youtubeId;
            const titleToArchive = currentTitle || title;

            await archiveStream(idToArchive, titleToArchive, subject);

            toast.success("✅ الحصة تم حفظها بنجاح في مكتبة الدروس", { position: "top-center" });

            // Reset Form
            setTitle("");
            setYoutubeId("");
        } catch (e) {
            toast.error("حدث خطأ أثناء الأرشفة");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-tajawal text-white">مركز القيادة المباشر</h1>
                {isLive && (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                        className="px-4 py-2 bg-red-600 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                    >
                        <Radio className="w-4 h-4 text-white" />
                        <span className="text-sm font-bold text-white uppercase">On Air</span>
                    </motion.div>
                )}
            </div>

            <GlassCard className="p-8 border-white/10 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {!isLive ? (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5">
                                    <Youtube className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white font-tajawal">إعداد البث الجديد</h2>
                                    <p className="text-zinc-400 text-sm font-tajawal">قم بربط معرف فيديو اليوتيوب لبدء الجلسة.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 font-tajawal">عنوان الحصة</label>
                                    <Input
                                        placeholder="مثال: مراجعة شاملة للوحدة الأولى"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-black/20 border-white/10 focus:border-red-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 font-tajawal">المادة / القسم</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/20 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                    >
                                        <option value="Physics">الفيزياء (Physics)</option>
                                        <option value="Math">الرياضيات (Math)</option>
                                        <option value="Science">العلوم (Science)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 font-tajawal">YouTube Video ID</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">youtube.com/watch?v=</span>
                                    <Input
                                        placeholder="dQw4w9WgXcQ"
                                        value={youtubeId}
                                        onChange={(e) => setYoutubeId(e.target.value)}
                                        className="pl-[160px] font-mono bg-black/20 border-white/10"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleGoLive}
                                disabled={loading}
                                className="w-full h-12 mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Go Live • بدء البث"}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center text-center space-y-6 py-10"
                        >
                            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center relative">
                                <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_3s_linear_infinite]" />
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)]" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white font-tajawal mb-2">{currentTitle}</h2>
                                <p className="text-zinc-400 font-mono">ID: {currentId}</p>
                            </div>

                            <div className="w-full max-w-xs bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Time Elapsed</p>
                                <p className="text-2xl font-mono text-white">00:42:15</p>
                                {/* Static mock for now, would need a timer hook */}
                            </div>

                            <Button
                                onClick={handleEndAndArchive}
                                disabled={loading}
                                variant="secondary"
                                className="w-full max-w-md h-12 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Archive className="w-4 h-4" />
                                        إنهاء وأرشفة (End & Archive)
                                    </span>
                                )}
                            </Button>

                            <p className="text-xs text-zinc-600 max-w-sm">
                                عند الإنهاء، سيتم نقل الفيديو تلقائياً إلى مكتبة الدروس وإغلاق البث المباشر للطلاب.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
}

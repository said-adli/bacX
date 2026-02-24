"use client";

import { useState } from "react";
import { Megaphone, Radio, AlertTriangle, Send } from "lucide-react";
import { sendGlobalNotification, toggleMaintenanceMode, toggleLiveGlobal } from "@/actions/admin-controls";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BroadcastNotification { id: string; title: string; message: string; created_at: string }

export default function GlobalControlsClient({
    recentNotifications,
    initialSettings
}: {
    recentNotifications: BroadcastNotification[],
    initialSettings: { maintenance: boolean, live: boolean }
}) {
    const router = useRouter();
    const [notifData, setNotifData] = useState({ title: "", message: "" });
    const [isSending, setIsSending] = useState(false);

    // Initial State from Server
    const [isMaintenance, setIsMaintenance] = useState(initialSettings.maintenance);
    const [isLive, setIsLive] = useState(initialSettings.live);

    const handleSendNotif = async () => {
        if (!notifData.title || !notifData.message) return toast.error("الرجاء ملء جميع الحقول");
        setIsSending(true);
        try {
            await sendGlobalNotification(notifData.title, notifData.message);
            toast.success("تم إرسال الإعلان");
            setNotifData({ title: "", message: "" });
            router.refresh();
        } catch (e) {
            toast.error("فشل الإرسال");
        } finally {
            setIsSending(false);
        }
    };

    const handleToggleMaintenance = async () => {
        const newState = !isMaintenance;
        if (!confirm(`تشغيل وضع الصيانة ${newState ? '؟' : '؟'}`)) return;

        // Optimistic
        setIsMaintenance(newState);
        try {
            await toggleMaintenanceMode(isMaintenance); // Action expects 'currentState' and flips it
            toast.info(`وضع الصيانة: ${newState ? 'مفعل' : 'معطل'}`);
        } catch (e) {
            setIsMaintenance(!newState); // Revert
            toast.error("فشل");
        }
    };

    const handleToggleLive = async () => {
        const newState = !isLive;
        // Optimistic
        setIsLive(newState);
        try {
            await toggleLiveGlobal(isLive);
            toast.success(`حالة البث: ${newState ? 'مباشر' : 'متوقف'}`);
        } catch (e) {
            setIsLive(!newState);
            toast.error("فشل");
        }
    };

    return (
        <div className="container mx-auto max-w-5xl space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8">الإعدادات العامة للنظام</h2>

            {/* System Status Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Maintenance Mode */}
                <div className={`p-6 rounded-3xl border transition-all ${isMaintenance ? 'bg-red-500/10 border-red-500/50' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-white/5">
                                <AlertTriangle className={isMaintenance ? "text-red-500" : "text-zinc-500"} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">وضع الصيانة</h3>
                                <p className="text-xs text-zinc-500">تعطيل وصول الطلبة</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleMaintenance}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${isMaintenance ? 'bg-red-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isMaintenance ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Live Banner */}
                <div className={`p-6 rounded-3xl border transition-all ${isLive ? 'bg-red-600/10 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'bg-black/20 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${isLive ? 'bg-red-500/20' : 'bg-white/5'}`}>
                                <Radio className={isLive ? "text-red-500 animate-pulse" : "text-zinc-500"} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">تنبيه البث المباشر</h3>
                                <p className="text-xs text-zinc-500">{`إظهار لافتة 'بث مباشر الآن'`}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleLive}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${isLive ? 'bg-red-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isLive ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Center follows... (unchanged logic) */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                {/* ...Same as before... */}
                <div className="flex items-center gap-4 mb-8">
                    <Megaphone className="text-blue-500" size={28} />
                    <div>
                        <h3 className="text-xl font-bold text-white">إعلان شامل</h3>
                        <p className="text-zinc-500">إرسال تنبيهات لجميع لوحات تحكم الطلبة</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">العنوان</label>
                            <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                placeholder="إعلان هام"
                                value={notifData.title}
                                onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">محتوى الرسالة</label>
                            <textarea
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
                                placeholder="اكتب رسالتك هنا..."
                                value={notifData.message}
                                onChange={(e) => setNotifData({ ...notifData, message: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={handleSendNotif}
                            disabled={isSending}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Send size={18} /> إرسال الإعلان الآن
                        </button>
                    </div>

                    {/* History */}
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                        <h4 className="text-zinc-400 font-bold text-sm uppercase mb-4 tracking-wider">الإعلانات السابقة</h4>
                        <div className="space-y-3">
                            {recentNotifications.map(n => (
                                <div key={n.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-start">
                                        <h5 className="font-bold text-white text-sm">{n.title}</h5>
                                        <span className="text-[10px] text-zinc-500">{new Date(n.created_at).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

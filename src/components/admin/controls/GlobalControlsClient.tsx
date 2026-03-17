"use client";

import { useState, useTransition } from "react";
import { Megaphone, Radio, AlertTriangle, Send, Trash2, Edit2, Loader2 } from "lucide-react";
import { sendGlobalNotification, toggleMaintenanceMode, toggleLiveGlobal, deleteNotification, updateNotification } from "@/actions/admin-controls";
import { Switch } from "@/components/ui/Switch";
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

    // Form State
    const [notifData, setNotifData] = useState({ title: "", message: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    // Delete State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Initial System State
    const [isMaintenance, setIsMaintenance] = useState(initialSettings.maintenance);
    const [isLive, setIsLive] = useState(initialSettings.live);

    const handleSendOrUpdate = async () => {
        if (!notifData.title || !notifData.message) return toast.error("الرجاء ملء جميع الحقول");
        setIsSending(true);
        try {
            if (editingId) {
                await updateNotification(editingId, notifData.title, notifData.message);
                toast.success("تم تحديث الإعلان بنجاح");
            } else {
                await sendGlobalNotification(notifData.title, notifData.message);
                toast.success("تم إرسال الإعلان");
            }
            // Reset form
            setNotifData({ title: "", message: "" });
            setEditingId(null);
            router.refresh();
        } catch (e) {
            toast.error("فشل الإرسال أو التحديث");
        } finally {
            setIsSending(false);
        }
    };

    const handleEditClick = (notif: BroadcastNotification) => {
        setNotifData({ title: notif.title, message: notif.message });
        setEditingId(notif.id);
        // Scroll to top to see form (optional, but good UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNotifData({ title: "", message: "" });
        setEditingId(null);
    };

    const confirmDelete = () => {
        if (!deletingId) return;

        startTransition(async () => {
            try {
                await deleteNotification(deletingId);
                toast.success("تم حذف الإعلان بنجاح");
                router.refresh();
                if (editingId === deletingId) {
                    handleCancelEdit(); // Clear form if deleting what we are currently editing
                }
            } catch (error) {
                toast.error("فشل حذف الإعلان");
            } finally {
                setShowDeleteConfirm(false);
                setDeletingId(null);
            }
        });
    };

    const handleToggleMaintenance = async () => {
        const newState = !isMaintenance;
        if (!confirm(`تشغيل وضع الصيانة ${newState ? '؟' : '؟'}`)) return;

        setIsMaintenance(newState);
        try {
            await toggleMaintenanceMode(isMaintenance);
            toast.info(`وضع الصيانة: ${newState ? 'مفعل' : 'معطل'}`);
        } catch (e) {
            setIsMaintenance(!newState); // Revert
            toast.error("فشل");
        }
    };

    const handleToggleLive = async () => {
        const newState = !isLive;
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
                        <Switch
                            checked={isMaintenance}
                            onCheckedChange={handleToggleMaintenance}
                            className="data-[state=checked]:bg-red-500"
                        />
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
                        <Switch
                            checked={isLive}
                            onCheckedChange={handleToggleLive}
                            className="data-[state=checked]:bg-red-500"
                        />
                    </div>
                </div>
            </div>

            {/* Notification Center */}
            <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-8">
                    <Megaphone className="text-blue-500" size={28} />
                    <div>
                        <h3 className="text-xl font-bold text-white">إعلان شامل</h3>
                        <p className="text-zinc-500">إرسال تنبيهات لجميع لوحات تحكم الطلبة</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Editor Form */}
                    <div className="space-y-4 relative">
                        {editingId && (
                            <div className="absolute -top-3 -right-3 bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1 backdrop-blur-md z-10">
                                <Edit2 size={12} />
                                جاري التعديل
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">العنوان</label>
                            <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                                placeholder="إعلان هام"
                                value={notifData.title}
                                onChange={(e) => setNotifData({ ...notifData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">محتوى الرسالة</label>
                            <textarea
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none transition-colors"
                                placeholder="اكتب رسالتك هنا..."
                                value={notifData.message}
                                onChange={(e) => setNotifData({ ...notifData, message: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSendOrUpdate}
                                disabled={isSending}
                                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? <Loader2 size={18} className="animate-spin" /> : editingId ? <Edit2 size={18} /> : <Send size={18} />}
                                {isSending ? "جاري الحفظ..." : editingId ? "تحديث الإعلان" : "إرسال الإعلان الآن"}
                            </button>
                            {editingId && (
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isSending}
                                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                            )}
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5 relative">
                        <h4 className="text-zinc-400 font-bold text-sm uppercase mb-4 tracking-wider">الإعلانات السابقة ({recentNotifications.length})</h4>
                        {(isPending && deletingId) && (
                            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                                <Loader2 className="animate-spin text-white" size={32} />
                            </div>
                        )}
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {recentNotifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`p-4 rounded-xl border transition-all group ${editingId === n.id ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-white text-sm">{n.title}</h5>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(n)}
                                                disabled={isPending}
                                                className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="تعديل"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => { setDeletingId(n.id); setShowDeleteConfirm(true); }}
                                                disabled={isPending}
                                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                title="حذف"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-zinc-500 mt-3">{new Date(n.created_at).toLocaleDateString('ar-DZ')} {new Date(n.created_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            ))}
                            {recentNotifications.length === 0 && (
                                <div className="text-center py-8 text-zinc-500 text-sm">لا توجد إعلانات سابقة</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">تأكيد حذف الإعلان</h3>
                        <p className="text-white/60 mb-6">هل أنت متأكد من حذف هذا الإعلان نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسوف يختفي من لوحة تحكم الطلبة.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isPending}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold transition-all disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isPending}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                {isPending ? "جاري الحذف..." : "نعم، حذف"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

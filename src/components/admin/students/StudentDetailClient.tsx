"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    User, Mail, Phone, Calendar, Shield, CreditCard,
    Clock, Activity, Eye, Ban, RotateCcw, AlertTriangle, CheckCircle, Bell, Send
} from "lucide-react";
import {
    toggleBanStudent,
    manualsExpireSubscription,
    extendSubscription,
    generateImpersonationLink
} from "@/actions/admin-students";
import { sendNotification, NotificationType } from "@/actions/notifications";

interface Student {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    created_at: string;
    is_banned: boolean;
    is_subscribed: boolean;
    subscription_end_date?: string | null;
}

interface Payment {
    id: string;
    amount: number;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    receipt_url?: string;
}

interface ActivityLog {
    id: string;
    event: string;
    created_at: string;
}

interface Progress {
    id: string;
    updated_at: string;
    lessons: {
        title: string;
    } | null;
}

interface StudentDetailProps {
    student: Student;
    payments: Payment[];
    activityLogs: ActivityLog[];
    progress: Progress[];
}

export default function StudentDetailClient({ student, payments, activityLogs, progress }: StudentDetailProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Notification State
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifTitle, setNotifTitle] = useState("");
    const [notifMessage, setNotifMessage] = useState("");
    const [notifType, setNotifType] = useState<NotificationType>("info");
    const [isSendingNotif, setIsSendingNotif] = useState(false);

    // Identity Data
    const joinDate = new Date(student.created_at).toLocaleDateString(undefined, { dateStyle: 'long' });
    const subEndDate = student.subscription_end_date
        ? new Date(student.subscription_end_date).toLocaleDateString(undefined, { dateStyle: 'long' })
        : "N/A";

    const isSubscribed = student.is_subscribed && student.subscription_end_date && new Date(student.subscription_end_date) > new Date();

    // HANDLERS

    const handleBan = async () => {
        const willBan = !student.is_banned;
        if (!confirm(`Are you sure you want to ${willBan ? 'BAN' : 'UNBAN'} this user?`)) return;

        setIsLoading(true);
        try {
            await toggleBanStudent(student.id, willBan);
            toast.success(`User ${willBan ? 'Banned' : 'Restored'}`);
            router.refresh();
        } catch (e) {
            toast.error("Action failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImpersonate = async () => {
        setIsLoading(true);
        try {
            const link = await generateImpersonationLink(student.id);
            if (link) {
                // Open in new tab
                window.open(link, '_blank');
                toast.success("Magic Link Generated & Opened");
            } else {
                toast.error("Could not generate link");
            }
        } catch (e) {
            toast.error("Masquerade failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpire = async () => {
        if (!confirm("Are you sure you want to IMMEDIATELY expire this subscription?")) return;
        setIsLoading(true);
        try {
            await manualsExpireSubscription(student.id);
            toast.success("Subscription Terminated");
            router.refresh();
        } catch (e) {
            toast.error("Failed to expire");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendNotif = async () => {
        if (!notifTitle.trim() || !notifMessage.trim()) {
            toast.error("يرجى ملء جميع الحقول");
            return;
        }

        setIsSendingNotif(true);
        try {
            await sendNotification(student.id, notifTitle, notifMessage, notifType);
            toast.success("تم إرسال الإشعار بنجاح");
            setIsNotifOpen(false);
            setNotifTitle("");
            setNotifMessage("");
        } catch (err) {
            toast.error("فشل إرسال الإشعار");
        } finally {
            setIsSendingNotif(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                        <span className="text-2xl font-bold text-blue-400">{student.full_name?.[0] || 'U'}</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            {student.full_name || "Unknown Student"}
                            {student.is_banned && <span className="text-xs bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-1 rounded-full">BANNED</span>}
                        </h1>
                        <p className="text-zinc-500 flex items-center gap-2 text-sm">
                            <span className="bg-white/5 px-2 py-0.5 rounded text-xs font-mono">{student.id}</span>
                            <span>• Joined {joinDate}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsNotifOpen(true)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 rounded-xl transition-all"
                    >
                        <Bell size={18} /> إرسال إشعار
                    </button>
                    <button
                        onClick={handleImpersonate}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 hover:bg-purple-600/20 rounded-xl transition-all"
                    >
                        <Eye size={18} /> View As User
                    </button>
                    <button
                        onClick={handleBan}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${student.is_banned ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                        {student.is_banned ? <><CheckCircle size={18} /> Unban</> : <><Ban size={18} /> Ban User</>}
                    </button>
                </div>
            </div>

            {/* Notification Modal */}
            {isNotifOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Bell className="text-blue-500" size={24} />
                            إرسال إشعار مباشر
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">نوع الإشعار</label>
                                <select
                                    value={notifType}
                                    onChange={(e) => setNotifType(e.target.value as NotificationType)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="info">معلومة (Info)</option>
                                    <option value="success">نجاح (Success)</option>
                                    <option value="warning">تحذير (Warning)</option>
                                    <option value="live">بث مباشر (Live)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">العنوان</label>
                                <input
                                    value={notifTitle}
                                    onChange={(e) => setNotifTitle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="مثال: تبليغ هام"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">الرسالة</label>
                                <textarea
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
                                    placeholder="اكتب رسالتك هنا..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsNotifOpen(false)}
                                disabled={isSendingNotif}
                                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSendNotif}
                                disabled={isSendingNotif}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                            >
                                {isSendingNotif ? "جاري الإرسال..." : <><Send size={18} /> إرسال</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Identity & Sub */}
                <div className="space-y-8">
                    {/* Identity Card */}
                    <div className="bg-black/20 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-500" /> Identity
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <Mail size={18} className="text-zinc-500" />
                                <div className="overflow-hidden">
                                    <p className="text-xs text-zinc-500 uppercase">Email</p>
                                    <p className="text-white text-sm truncate">{student.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <Phone size={18} className="text-zinc-500" />
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase">Phone</p>
                                    <p className="text-white text-sm">{student.phone || "Not Set"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                <Shield size={18} className="text-zinc-500" />
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase">Role</p>
                                    <p className="text-white text-sm capitalize">{student.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className={`p-6 rounded-3xl border transition-all ${isSubscribed ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/10 border-red-500/20'}`}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard size={20} className={isSubscribed ? "text-blue-500" : "text-red-500"} /> Subscription
                        </h3>

                        <div className="space-y-1 mb-6">
                            <p className="text-3xl font-bold text-white">{isSubscribed ? "ACTIVE" : "EXPIRED"}</p>
                            <p className="text-zinc-400 text-sm">Ends: {subEndDate}</p>
                        </div>

                        {isSubscribed && (
                            <button
                                onClick={handleExpire}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all"
                            >
                                Terminate Subscription
                            </button>
                        )}
                    </div>
                </div>

                {/* MIDDLE & RIGHT: History */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Activity & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Last Seen */}
                        <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-zinc-500" /> Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {activityLogs.length > 0 ? activityLogs.map((log) => (
                                    <div key={log.id} className="text-sm">
                                        <p className="text-white">{log.event || "Login"}</p>
                                        <p className="text-xs text-zinc-500">{new Date(log.created_at).toLocaleString()}</p>
                                    </div>
                                )) : (
                                    <p className="text-zinc-500 text-sm italic">No recent logs.</p>
                                )}
                            </div>
                        </div>

                        {/* Learning Progress */}
                        <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-zinc-500" /> Learning Path
                            </h3>
                            <div className="space-y-3">
                                {progress.length > 0 ? progress.map((p) => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-white text-sm truncate">{p.lessons?.title || "Unknown Lesson"}</p>
                                            <p className="text-[10px] text-zinc-500">{new Date(p.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-zinc-500 text-sm italic">No lessons completed yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial History */}
                    <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ReceiptIcon /> Payment History
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase tracking-wider">
                                        <th className="pb-3 pl-4">Date</th>
                                        <th className="pb-3">Proof</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3 text-right pr-4">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-zinc-300">
                                    {payments.length > 0 ? payments.map((pay) => (
                                        <tr key={pay.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-4 pl-4">{new Date(pay.created_at).toLocaleDateString()}</td>
                                            <td className="py-4">
                                                {pay.receipt_url ? (
                                                    <a href={pay.receipt_url} target="_blank" className="text-blue-400 hover:underline">View Receipt</a>
                                                ) : (
                                                    <span className="text-zinc-600">No Image</span>
                                                )}
                                            </td>
                                            <td className="py-4">
                                                <Badge status={pay.status} />
                                            </td>
                                            <td className="py-4 text-right pr-4 font-mono">
                                                {pay.amount ? `${pay.amount} DA` : '-'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-zinc-500">No payment records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        approved: "bg-green-500/10 text-green-400 border-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        rejected: "bg-red-500/10 text-red-400 border-red-500/20"
    };

    const style = styles[status] || "bg-zinc-500/10 text-zinc-400";

    return (
        <span className={`px-2 py-1 rounded text-xs border uppercase font-bold ${style}`}>
            {status}
        </span>
    );
}

function ReceiptIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 17V7" />
        </svg>
    )
}

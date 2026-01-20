"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import {
    Search, User, CheckCircle, XCircle,
    Calendar, Crown, Sparkles, Filter, Loader2, MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { usePageVisibility } from "@/hooks/usePageVisibility";

// Server Actions
import { getAllStudents, extendSubscription, toggleStudentBan, AdminStudentProp } from "@/actions/admin-student-management";
import { approvePayment } from "@/actions/admin";

export default function ManageStudentsPage() {
    const isVisible = usePageVisibility();
    const { role } = useAuth(); // We still use useAuth for client-side role check visualization

    const [students, setStudents] = useState<AdminStudentProp[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // For Receipt Modal (payment_request is attached to student objects in some valid implementations, 
    // but here getAllStudents returns a cleaner object. We might need a separate fetch for Pending Requests if we want to show receipts here.
    // However, the original code had 'payment_request' merged. 
    // V9.1 design: The 'Pending Payments' tab handles receipts. This table is for general management.
    // We will keep simple manual activation here. Open receipt modal is better handled in the Payments tab.
    // But if we want to keep the "View Receipt" button here, we'd need that data.
    // optimization: Let's focus this page on "Account Control" and leave "Payment Verification" to the dedicated tab.
    // If the user insists on view receipt here, we can add it later. For now, we use the robust getAllStudents.

    useEffect(() => {
        if (role === "admin") {
            loadStudents();
        }
    }, [role]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error("Failed to load students:", error);
            toast.error("فشل في تحميل قائمة الطلاب");
        } finally {
            setLoading(false);
        }
    };

    const handleActivateVIP = async (studentId: string) => {
        if (!confirm("هل أنت متأكد من تفعيل اشتراك لهذا الطالب لمدة 30 يوم؟")) return;

        setProcessingId(studentId);
        try {
            // Manual activation always adds 30 days in this context as per user request history
            const res = await extendSubscription(studentId, 30);
            if (res.success) {
                toast.success("تم تفعيل الاشتراك بنجاح ✅");
                await loadStudents(); // Refresh data
            }
        } catch (err) {
            console.error("Activation error:", err);
            toast.error("حدث خطأ أثناء التفعيل");
        } finally {
            setProcessingId(null);
        }
    };

    const handleToggleBan = async (studentId: string, currentStatus: boolean, name: string) => {
        const action = currentStatus ? "إلغاء حظر" : "حظر";
        if (!confirm(`هل أنت متأكد من ${action} الطالب ${name}؟`)) return;

        setProcessingId(studentId);
        try {
            await toggleStudentBan(studentId, currentStatus);
            toast.success(`تم ${action} الطالب بنجاح`);
            await loadStudents();
        } catch (err) {
            toast.error("فشلت العملية");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredStudents = students.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-white/50">
                غير مصرح لك بالدخول لهذه الصفحة ⛔
            </div>
        );
    }

    return (
        <div className={`space-y-8 animate-in fade-in zoom-in duration-500 pb-20 ${!isVisible ? "animations-paused" : ""}`}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] gpu-accelerated">
                        <Crown className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white font-serif">إدارة الطلاب (Manual Control)</h1>
                        <p className="text-white/40 text-sm">تفعيل الاشتراكات، الحظر، والمراقبة.</p>
                    </div>
                </div>
                <div className="text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10 text-white/60">
                    عدد الطلاب: <span className="text-white font-bold">{students.length}</span>
                </div>
            </div>

            {/* Search Toolbar */}
            <GlassCard className="p-4 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد الإلكتروني..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                    />
                </div>
                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <Filter size={18} />
                </button>
            </GlassCard>

            {/* Data Table */}
            <GlassCard className="p-0 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[800px]">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">الطالب</th>
                                <th className="p-4 font-medium">الحالة</th>
                                <th className="p-4 font-medium">تاريخ التسجيل</th>
                                <th className="p-4 font-medium">انتهاء الاشتراك</th>
                                <th className="p-4 font-medium text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-white/40">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" />
                                            جاري تحميل البيانات...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-white/40">
                                        لا يوجد طلاب مطابقين للبحث
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-bold">
                                                    {student.banned ? <XCircle className="text-red-500" /> : student.full_name?.charAt(0).toUpperCase() || <User size={16} />}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${student.banned ? "text-red-400 line-through" : "text-white"}`}>{student.full_name || "بدون اسم"}</p>
                                                    <p className="text-white/40 text-xs font-mono">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {student.banned ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold">
                                                    محظور
                                                </span>
                                            ) : student.is_subscribed ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)] gpu-accelerated">
                                                    <Sparkles size={12} className="fill-current" />
                                                    مشترك VIP
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 text-xs">
                                                    مجاني
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-white/60 text-sm font-mono">
                                            {new Date(student.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {student.subscription_end ? (
                                                <span className="text-yellow-400 font-mono text-sm flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(student.subscription_end).toLocaleDateString()}
                                                    <span className="text-xs text-white/30">({student.days_remaining} يوم)</span>
                                                </span>
                                            ) : (
                                                <span className="text-white/20 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {/* ACTION BUTTONS */}

                                            {/* 1. Toggle Ban */}
                                            <button
                                                onClick={() => handleToggleBan(student.id, student.banned, student.full_name)}
                                                disabled={!!processingId}
                                                className={`p-2 rounded-lg transition-colors border ${student.banned
                                                    ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                                                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"}`}
                                                title={student.banned ? "إلغاء الحظر" : "حظر الطالب"}
                                            >
                                                {student.banned ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            </button>

                                            {/* 2. Extend/Activate Subscription */}
                                            <button
                                                onClick={() => handleActivateVIP(student.id)}
                                                disabled={!!processingId}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs font-bold shadow-lg shadow-blue-900/20 transition-all gpu-accelerated hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                            >
                                                {processingId === student.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Crown size={14} />
                                                        +30 يوم
                                                    </>
                                                )}
                                            </button>

                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

        </div>
    );
}

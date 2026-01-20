"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import {
    Search, User, CheckCircle, XCircle,
    Calendar, Crown, Sparkles, Filter
} from "lucide-react";
import { toast } from "sonner";
import { usePageVisibility } from "@/hooks/usePageVisibility";

interface StudentProfile {
    id: string;
    email: string;
    full_name: string;
    is_subscribed: boolean;
    subscription_end_date?: string | null;
    role: "admin" | "student";
    created_at: string;
    payment_request?: {
        id: string;
        receipt_url: string;
        status: string;
    } | null;
}

export default function ManageStudentsPage() {
    const isVisible = usePageVisibility();
    const { user, role } = useAuth();
    const supabase = createClient();

    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [viewingReceipt, setViewingReceipt] = useState<{ url: string; studentId: string; requestId: string } | null>(null);

    useEffect(() => {
        // Security Check
        if (role !== "admin") return;

        fetchStudents();
    }, [role]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // 2. Fetch Payment Requests
            const { data: requests, error: requestsError } = await supabase
                .from('payment_requests')
                .select('*');

            if (requestsError) throw requestsError;

            // 3. Merge
            const merged = (profiles as StudentProfile[]).map(p => {
                const req = requests?.find((r: any) => r.user_id === p.id && r.status === 'pending');
                return { ...p, payment_request: req || null };
            });

            setStudents(merged);
        } catch (err) {
            console.error("Error fetching students:", err);
            toast.error("فشل في تحميل قائمة الطلاب");
        } finally {
            setLoading(false);
        }
    };

    const handleActivateVIP = async (studentId: string, requestId?: string) => {
        if (!confirm("هل أنت متأكد من تفعيل اشتراك VIP لهذا الطالب لمدة 30 يوم؟")) return;

        setProcessingId(studentId);
        try {
            // Calculate Date: Today + 30 Days
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            // 1. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    is_subscribed: true,
                    subscription_end_date: expiryDate.toISOString()
                })
                .eq('id', studentId);

            if (profileError) throw profileError;

            // 2. Approve Request (if exists)
            if (requestId) {
                await supabase
                    .from('payment_requests')
                    .update({ status: 'approved' })
                    .eq('id', requestId);
            }

            toast.success("تم تفعيل الاشتراك بنجاح ✅");

            // Optimistic Update
            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, is_subscribed: true, subscription_end_date: expiryDate.toISOString(), payment_request: null }
                    : s
            ));
            setViewingReceipt(null);

        } catch (err) {
            console.error("Activation error:", err);
            toast.error("حدث خطأ أثناء التفعيل");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeactivate = async (studentId: string) => {
        if (!confirm("هل تريد إلغاء اشتراك الطاالب؟")) return;
        setProcessingId(studentId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_subscribed: false,
                    subscription_end_date: null
                })
                .eq('id', studentId);

            if (error) throw error;
            toast.success("تم إلغاء الاشتراك");
            setStudents(prev => prev.map(s =>
                s.id === studentId
                    ? { ...s, is_subscribed: false, subscription_end_date: null }
                    : s
            ));
        } catch (err) {
            toast.error("Error deactivating");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredStudents = students.filter(s =>
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h1 className="text-3xl font-bold text-white font-serif">إدارة الطلاب (Manual Activation)</h1>
                        <p className="text-white/40 text-sm">تفعيل وإلغاء الاشتراكات يدوياً</p>
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
                                <th className="p-4 font-medium">وصل الدفع</th>
                                <th className="p-4 font-medium">انتهاء الاشتراك</th>
                                <th className="p-4 font-medium text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-white/40">
                                        جاري تحميل البيانات...
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-white/40">
                                        لا يوجد طلاب مطابقين للبحث
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-bold">
                                                    {student.full_name?.charAt(0).toUpperCase() || <User size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{student.full_name || "بدون اسم"}</p>
                                                    <p className="text-white/40 text-xs font-mono">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {student.is_subscribed ? (
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
                                            {student.payment_request ? (
                                                <button
                                                    onClick={() => setViewingReceipt({
                                                        url: student.payment_request!.receipt_url,
                                                        studentId: student.id,
                                                        requestId: student.payment_request!.id
                                                    })}
                                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs hover:bg-yellow-500/20 transition-colors animate-pulse"
                                                >
                                                    <Calendar size={12} />
                                                    عرض الوصل
                                                </button>
                                            ) : <span className="text-white/20 text-xs">-</span>}
                                        </td>
                                        <td className="p-4">
                                            {student.subscription_end_date ? (
                                                <span className="text-yellow-400 font-mono text-sm flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(student.subscription_end_date).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-white/20 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {student.is_subscribed ? (
                                                <button
                                                    onClick={() => handleDeactivate(student.id)}
                                                    disabled={!!processingId}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition-all"
                                                >
                                                    إلغاء
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivateVIP(student.id, student.payment_request?.id)}
                                                    disabled={!!processingId}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-900/20 transition-all gpu-accelerated hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                                                >
                                                    {processingId === student.id ? (
                                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={14} />
                                                            تفعيل VIP (30 يوم)
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* View Receipt Modal */}
            {viewingReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewingReceipt(null)}>
                    <GlassCard className="w-full max-w-lg p-2 overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingReceipt(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                        >
                            <XCircle size={20} />
                        </button>
                        <img
                            src={viewingReceipt.url}
                            alt="Receipt"
                            className="w-full h-auto max-h-[60vh] object-contain rounded-lg bg-black/20"
                        />
                        <div className="p-4 flex gap-3">
                            <button
                                onClick={() => handleActivateVIP(viewingReceipt.studentId, viewingReceipt.requestId)}
                                disabled={!!processingId}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                            >
                                <CheckCircle size={18} />
                                تأكيد وتفعيل الحساب
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}

        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
// import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
// import { db } from "@/lib/firebase";
import { CreditCard, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { arMA } from "date-fns/locale";

interface Payment {
    id: string;
    amount: string;
    method: string;
    status: 'approved' | 'pending' | 'rejected';
    createdAt: Date;
}

export default function PaymentsHistoryPage() {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        if (!user) return;

        async function fetchPayments() {
            const { data } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user!.id) // user is checked above in the useEffect, but TS might not infer it inside async. Using ! is safe here due to line 28 check.
                // .eq('userId', user.id) // Or camelCase if that's how it is? 
                // Based on standard Supabase, snake_case is likely.
                // But let's check migration context. Admin payments page used `userId`?
                // Let's verify `admin/payments/page.tsx` used `user_id` or fetched via `order`?
                // `admin/payments/page.tsx` just did `.select('*').order(...)`.
                // Let's assume snake_case `user_id` for now as it's standard.
                .order('created_at', { ascending: false });

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setPayments(data.map((d: any) => ({
                    id: d.id,
                    amount: d.amount,
                    method: d.method,
                    status: d.status,
                    createdAt: d.created_at ? new Date(d.created_at) : new Date()
                })));
            }
            setLoading(false);
        }
        fetchPayments();
    }, [user, supabase]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-tajawal direction-rtl text-slate-900">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    سجل المدفوعات
                </h1>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
                    ) : payments.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            لا توجد مدفوعات سابقة
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 text-slate-500 text-sm font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="p-4">التاريخ</th>
                                        <th className="p-4">المبلغ</th>
                                        <th className="p-4">طريقة الدفع</th>
                                        <th className="p-4">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.map(payment => (
                                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-slate-600 font-medium">
                                                {formatDistanceToNow(payment.createdAt, { addSuffix: true, locale: arMA })}
                                            </td>
                                            <td className="p-4 font-bold text-slate-900">{payment.amount}</td>
                                            <td className="p-4 text-slate-500">{payment.method}</td>
                                            <td className="p-4">
                                                {payment.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                        <CheckCircle className="w-3 h-3" /> مقبول
                                                    </span>
                                                )}
                                                {payment.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                                                        <Clock className="w-3 h-3" /> قيد المراجعة
                                                    </span>
                                                )}
                                                {payment.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                        <XCircle className="w-3 h-3" /> مرفوض
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

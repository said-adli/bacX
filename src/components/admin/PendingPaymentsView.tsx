"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from "next/image";

interface PaymentDoc {
    id: string;
    user_id: string;
    full_name: string;
    amount: string;
    plan_id: string;
    method: string;
    receipt_url: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export function PendingPaymentsView() {
    const supabase = createClient();
    const [payments, setPayments] = useState<PaymentDoc[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Initial Fetch + Realtime
    useEffect(() => {
        const fetchPayments = async () => {
            const { data } = await supabase
                .from('payment_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (data) setPayments(data as PaymentDoc[]);
        };

        fetchPayments();

        const channel = supabase.channel('pending_payments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'payment_requests',
                    filter: 'status=eq.pending'
                },
                () => fetchPayments() // Simple refresh on change
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleApprove = async (payment: PaymentDoc) => {
        setProcessingId(payment.id);
        try {
            // Determine duration based on plan (simple logic for now)
            const durationDays = payment.plan_id === 'annual' ? 365 : 90;

            const { approvePayment } = await import("@/actions/admin");
            const result = await approvePayment(payment.id, payment.user_id, durationDays);

            if (!result.success) throw new Error(result.message);

            toast.success("تم تفعيل الاشتراك بنجاح");

            // Optimistic update
            setPayments(prev => prev.filter(p => p.id !== payment.id));
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : "Unknown error";
            toast.error("حدث خطأ: " + msg);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (paymentId: string) => {
        if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
        setProcessingId(paymentId);
        try {
            const { rejectPayment } = await import("@/actions/admin");
            const result = await rejectPayment(paymentId, "Rejected by Admin");

            if (!result.success) throw new Error(result.message);

            toast.success("تم رفض الطلب");
            setPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch (e: unknown) {
            console.error(e);
            toast.error("حدث خطأ");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                طلبات الاشتراك المعلقة ({payments.length})
            </h2>

            {payments.length === 0 ? (
                <div className="text-center py-10 text-zinc-500">لا توجد طلبات معلقة حالياً.</div>
            ) : (
                payments.map((payment) => (
                    <GlassCard key={payment.id} className="p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            {/* Receipt Preview Thumbnail */}
                            <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer" className="group relative w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden border border-white/10 flex-shrink-0">
                                <Image src={payment.receipt_url || '/placeholder.png'} alt="Receipt" fill className="object-cover" unoptimized />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <ExternalLink className="w-4 h-4 text-white" />
                                </div>
                            </a>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate text-white">{payment.full_name || 'مستخدم'}</h3>
                                <p className="text-xs text-zinc-400 font-mono truncate">{payment.user_id}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                        {payment.amount}
                                    </span>
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                        {payment.plan_id}
                                    </span>
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                        {payment.method}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="ghost"
                                disabled={processingId === payment.id}
                                onClick={() => handleReject(payment.id)}
                                className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                            >
                                {processingId === payment.id ? "Processing..." : (
                                    <>
                                        <XCircle className="w-4 h-4 ml-2" />
                                        رفض
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="primary"
                                disabled={processingId === payment.id}
                                onClick={() => handleApprove(payment)}
                                className="flex-1"
                            >
                                {processingId === payment.id ? "Processing..." : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 ml-2" />
                                        قبول
                                    </>
                                )}
                            </Button>
                        </div>
                    </GlassCard>
                ))
            )}
        </motion.div>
    );
}

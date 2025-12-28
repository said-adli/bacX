"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { approvePayment, rejectPayment, PaymentRequest } from "@/lib/payment-service";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PaymentDoc extends PaymentRequest {
    id: string;
}

export function PendingPaymentsView() {
    const [payments, setPayments] = useState<PaymentDoc[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "payments"), where("status", "==", "pending"));
        const unsub = onSnapshot(q, (snap) => {
            const list: PaymentDoc[] = [];
            snap.forEach(doc => {
                list.push({ id: doc.id, ...doc.data() } as PaymentDoc);
            });
            setPayments(list);
        });
        return () => unsub();
    }, []);

    const handleApprove = async (paymentId: string, userId: string) => {
        setProcessingId(paymentId);
        try {
            await approvePayment(paymentId, userId);
            toast.success("تم تفعيل الاشتراك بنجاح");
        } catch (e) {
            console.error(e);
            toast.error("حدث خطأ");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (paymentId: string, userId: string) => {
        if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
        setProcessingId(paymentId);
        try {
            await rejectPayment(paymentId, userId);
            toast.success("تم رفض الطلب");
        } catch (e) {
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
                            <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="group relative w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden border border-white/10 flex-shrink-0">
                                <img src={payment.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-4 h-4 text-white" />
                                </div>
                            </a>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate text-white">{payment.userName}</h3>
                                <p className="text-xs text-zinc-400 font-mono truncate">{payment.userId}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                        {payment.amount}
                                    </span>
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                        {payment.plan}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="ghost"
                                disabled={processingId === payment.id}
                                onClick={() => handleReject(payment.id, payment.userId)}
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
                                onClick={() => handleApprove(payment.id, payment.userId)}
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

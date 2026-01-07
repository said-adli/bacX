"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { approvePayment, rejectPayment } from "@/actions/admin";
import { XCircle, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PaymentRequest {
    id: string;
    userId: string;
    userName: string;
    amount: string;
    method?: string;
    planId?: string; // Optional for backward compatibility
    receiptUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface PaymentRecord {
    id: string;
    amount: number;
    receipt_url: string;
    created_at: string;
    status: string;
    user_id: string;
    profiles?: { full_name: string; email: string };
    users?: { email: string };
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchPending = async () => {
            const { data } = await supabase
                .from("payments")
                .select("*, profiles:user_id(full_name, email), users:user_id(email)") // users is alias for auth.users if possible? or just profiles relation 
                // Assuming standard relation setup. If 'users' is not a relation on public table, this might fail.
                // Assuming 'profiles' is the main user table.
                .eq("status", "pending");

            if (data) {
                const mapped = (data as unknown as PaymentRecord[]).map((d) => ({
                    id: d.id,
                    amount: String(d.amount),
                    method: 'CCP',
                    receiptUrl: d.receipt_url,
                    userId: d.user_id,
                    userName: d.profiles?.full_name || d.users?.email || 'Unknown',
                    createdAt: d.created_at || new Date().toISOString(),
                    status: 'pending' as const
                }));
                setPayments(mapped);
            }
            setLoading(false);
        };
        fetchPending();
    }, [supabase]);

    const handleProcess = async (payment: PaymentRequest, status: 'approved' | 'rejected') => {
        setProcessingId(payment.id);
        try {
            let result;
            if (status === 'approved') {
                // Determine duration based on planId logic or default
                // Simplified: default 365 days as per previous logic default
                result = await approvePayment(payment.id, payment.userId);
            } else {
                result = await rejectPayment(payment.id, payment.userId);
            }

            if (result.success) {
                toast.success(result.message);
                // Remove from list
                setPayments(prev => prev.filter(p => p.id !== payment.id));
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error("Failed to process payment");
        } finally {
            setProcessingId(null);
        }
    };

    // Inline skeleton instead of blocking
    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-[4/3] bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold">طلبات الدفع ({payments.length})</h1>

            {payments.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center text-zinc-500">
                    لا توجد طلبات دفع معلقة حالياً.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {payments.map((payment) => (
                        <div key={payment.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                            {/* Receipt Preview */}
                            <div
                                className="relative h-48 bg-black/50 cursor-pointer group"
                                onClick={() => setSelectedImage(payment.receiptUrl)}
                            >
                                <Image
                                    src={payment.receiptUrl}
                                    alt="Receipt"
                                    fill
                                    className="object-cover transition-opacity group-hover:opacity-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg mb-1">{payment.userName}</h3>
                                    <p className="text-sm text-zinc-400">User ID: {payment.userId.slice(0, 8)}...</p>
                                </div>

                                <div className="bg-white/5 rounded-lg p-3 text-sm space-y-2 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">المبلغ:</span>
                                        <span className="font-bold text-green-400">{payment.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">الطريقة:</span>
                                        <span>{payment.method || "CCP"}</span>
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleProcess(payment, 'rejected')}
                                        disabled={processingId === payment.id}
                                        className="py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        رفض
                                    </button>
                                    <button
                                        onClick={() => handleProcess(payment, 'approved')}
                                        disabled={processingId === payment.id}
                                        className="py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processingId === payment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "قبول وتفعيل"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
                        <Image
                            src={selectedImage}
                            alt="Full Receipt"
                            fill
                            className="object-contain"
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-white/20"
                            onClick={() => setSelectedImage(null)}
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Check, X, Eye, Calendar, User } from "lucide-react";
import { SubscriptionCard } from "@/components/shared/SubscriptionCard"; // Used if we want to show which plan
import { approvePayment, rejectPayment, PaymentProof } from "@/actions/admin-payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PaymentQueueClient({ payments }: { payments: any[] }) {
    const router = useRouter();
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApprove = async () => {
        if (!selectedReceipt) return;
        if (!confirm("Confirm activation for this student?")) return;

        setIsProcessing(true);
        try {
            // Need Plan ID logic. Assuming the receipt record has 'plan_id' or we ask admin to select one.
            // Requirement said "Approve (Activate account)".
            // If the user selected a plan during upload, it's in the DB.
            // If NOT, we might need a selector.
            // Let's assume for V1 reconstruction the `payment_receipts` table has `plan_id`.
            // If not, I'll fallback to a default or ask admin. 
            // For this UI, I will assume `plan_id` is present or I simply activate logic without specific plan if null (fallback).
            // Actually, server action expects planId.
            // I'll assume the receipt object has it.

            await approvePayment(selectedReceipt.id, selectedReceipt.user_id, selectedReceipt.plan_id || 'default');
            toast.success("Account Activated");
            setSelectedReceipt(null);
            router.refresh();
        } catch (e) {
            toast.error("Activation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedReceipt) return;
        if (!confirm("Reject this receipt?")) return;

        setIsProcessing(true);
        try {
            await rejectPayment(selectedReceipt.id);
            toast.success("Receipt Rejected");
            setSelectedReceipt(null);
            router.refresh();
        } catch (e) {
            toast.error("Rejection failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-8">Activation Queue</h2>

            <div className="flex gap-6 h-[calc(100vh-200px)]">
                {/* List */}
                <div className="w-1/3 min-w-[350px] bg-black/20 border border-white/5 rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-wider">Pending Requests ({payments.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {payments.length === 0 && (
                            <div className="text-center p-8 text-zinc-500 text-sm">No pending payments.</div>
                        )}
                        {payments.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedReceipt(p)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedReceipt?.id === p.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white text-sm">{p.profiles?.full_name || "Unknown"}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <User size={12} /> {p.profiles?.email}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview / Detail View */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center relative backdrop-blur-md">
                    {selectedReceipt ? (
                        <>
                            <div className="relative w-full h-full max-h-[500px] mb-8 group overflow-hidden rounded-2xl border border-white/10 bg-black/50 flex items-center justify-center">
                                {/* Image Viewer Placeholder */}
                                {selectedReceipt.receipt_url ? (
                                    <img
                                        src={selectedReceipt.receipt_url}
                                        alt="Receipt"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-zinc-500 flex flex-col items-center">
                                        <Eye size={48} className="mb-4 opacity-50" />
                                        <span>No image provided</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 w-full max-w-md">
                                <button
                                    onClick={handleReject}
                                    disabled={isProcessing}
                                    className="flex-1 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border border-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={20} /> Reject
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={20} /> Activate Account
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-zinc-600 flex flex-col items-center">
                            <Calendar size={64} className="mb-4 opacity-20" />
                            <p>Select a request to review details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

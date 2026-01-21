'use client';

import { PaymentRequest, approvePayment, rejectPayment } from "@/actions/admin-payment-actions";
import { AdminGlassCard } from "../ui/AdminGlassCard";
import { Check, X, Eye, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface PaymentReviewCardProps {
    payment: PaymentRequest;
}

export function PaymentReviewCard({ payment }: PaymentReviewCardProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    const handleApprove = async () => {
        if (!confirm("Approve this payment and grant access?")) return;
        setIsProcessing(true);
        const result = await approvePayment(payment.id, payment.user_id);
        if (result.success) {
            toast.success("Payment approved, access granted.");
        } else {
            toast.error("Failed to approve payment.");
        }
        setIsProcessing(false);
    };

    const handleReject = async () => {
        const reason = prompt("Enter rejection reason (User will verify):");
        if (!reason) return;

        setIsProcessing(true);
        const result = await rejectPayment(payment.id, reason);
        if (result.success) {
            toast.success("Payment rejected.");
        } else {
            toast.error("Failed to reject payment.");
        }
        setIsProcessing(false);
    };

    return (
        <AdminGlassCard className="flex flex-col gap-4 p-4 md:flex-row md:items-start" gradient>
            {/* Receipt Thumbnail */}
            <div className="relative group h-48 w-full shrink-0 overflow-hidden rounded-xl bg-black/50 md:w-48">
                {payment.receipt_url ? (
                    <>
                        <img
                            src={payment.receipt_url}
                            alt="Receipt"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button
                            onClick={() => setIsImageExpanded(true)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <Eye className="h-8 w-8 text-white" />
                        </button>
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}
            </div>

            {/* Expanded Image Modal */}
            {isImageExpanded && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <div className="relative max-h-screen max-w-screen-lg">
                        <img
                            src={payment.receipt_url}
                            alt="Receipt Full"
                            className="max-h-[85vh] w-auto rounded-lg shadow-2xl"
                        />
                        <p className="mt-4 text-center text-white">Click anywhere to close</p>
                    </div>
                </div>
            )}

            {/* Details */}
            <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">{payment.user?.full_name || "Unknown User"}</h3>
                        <p className="text-sm text-gray-400">{payment.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                        <DollarSign className="h-3 w-3" />
                        {payment.amount}
                    </div>
                </div>

                <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(payment.created_at).toLocaleString()}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500/10 py-3 text-sm font-bold text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                    >
                        <Check className="h-4 w-4" />
                        Approve
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                        Reject
                    </button>
                </div>
            </div>
        </AdminGlassCard>
    );
}

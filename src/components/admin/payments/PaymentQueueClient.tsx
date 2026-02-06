"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Calendar, User, AlertTriangle, Sparkles, Loader2, ZoomIn } from "lucide-react";
import { approvePayment, rejectPayment } from "@/actions/admin-payments";
import { getActivePlans, SubscriptionPlan } from "@/actions/admin-plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"; // Fixed import casing

interface PaymentQueueItem {
    id: string;
    user_id: string;
    plan_id?: string;
    receipt_url?: string;
    created_at: string;
    amount?: number; // Assuming we might have this, or we compare with Plan Price
    profiles?: { full_name?: string; email?: string };
}

export default function PaymentQueueClient({ payments }: { payments: PaymentQueueItem[] }) {
    const router = useRouter();
    const [selectedReceipt, setSelectedReceipt] = useState<PaymentQueueItem | null>(null);
    const [activePlans, setActivePlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");

    // UI States
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        getActivePlans().then(setActivePlans).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedReceipt) {
            setSelectedPlanId(selectedReceipt.plan_id || "");
            setRejectReason("");
        }
    }, [selectedReceipt]);

    const handleApprove = async () => {
        if (!selectedReceipt) return;
        if (!selectedPlanId) {
            toast.error("Select a plan first");
            return;
        }
        if (!confirm("Confirm activation?")) return;

        setIsProcessing(true);
        try {
            await approvePayment(selectedReceipt.id, selectedReceipt.user_id, selectedPlanId);
            toast.success("Activated successfully");
            setSelectedReceipt(null);
            router.refresh();
        } catch (e: any) {
            toast.error(e.message || "Activation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedReceipt) return;
        if (!rejectReason.trim()) {
            toast.error("Reason is required");
            return;
        }

        setIsProcessing(true);
        try {
            await rejectPayment(selectedReceipt.id, rejectReason);
            toast.success("Rejected successfully");
            setShowRejectDialog(false);
            setSelectedReceipt(null);
            router.refresh();
        } catch (e: any) {
            toast.error(e.message || "Rejection failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedPlan = activePlans.find(p => p.id === selectedPlanId);

    return (
        <div className="container mx-auto max-w-7xl h-full flex flex-col p-6">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="text-yellow-400" /> Payment & Activation
            </h2>

            <div className="flex gap-6 h-[calc(100vh-180px)]">
                {/* 1. QUEUE LIST */}
                <div className="w-80 bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col backdrop-blur-md">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-bold text-zinc-400 text-xs uppercase tracking-wider">Pending ({payments.length})</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {payments.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedReceipt(p)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedReceipt?.id === p.id ? 'bg-blue-600/20 border-blue-500' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-zinc-200 text-sm">{p.profiles?.full_name || "Unknown"}</span>
                                    <span className="text-[10px] text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-zinc-500 truncate">{p.profiles?.email}</div>
                            </div>
                        ))}
                        {payments.length === 0 && <div className="p-8 text-center text-zinc-600 text-sm">Empty Queue</div>}
                    </div>
                </div>

                {/* 2. WORKSPACE */}
                {selectedReceipt ? (
                    <div className="flex-1 flex gap-6">
                        {/* RECEIPT VIEWER */}
                        <div className="flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col relative group">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                                <Eye size={14} /> Official Receipt
                            </h4>
                            <div className="flex-1 relative rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                                {selectedReceipt.receipt_url ? (
                                    <>
                                        <img
                                            src={selectedReceipt.receipt_url}
                                            alt="Receipt"
                                            className="max-w-full max-h-full object-contain cursor-zoom-in"
                                            onClick={() => setIsZoomed(true)}
                                        />
                                        <button
                                            onClick={() => setIsZoomed(true)}
                                            className="absolute bottom-4 right-4 bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ZoomIn size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-zinc-500 flex flex-col items-center">
                                        <AlertTriangle size={32} className="mb-2 opacity-50 text-amber-500" />
                                        <span>No Receipt Image</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CONTROLS */}
                        <div className="w-[380px] bg-zinc-900/80 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
                            {/* COMPARISON UI */}
                            <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4">Financial Verification</h4>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-[10px] text-zinc-400 uppercase">Student Name</label>
                                        <div className="text-white font-bold text-lg">{selectedReceipt.profiles?.full_name}</div>
                                        <div className="text-zinc-500 text-xs">{selectedReceipt.profiles?.email}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                                            <label className="text-[10px] text-zinc-500 uppercase">Entered Amount</label>
                                            <div className="text-zinc-300 font-mono font-bold">
                                                {selectedReceipt.amount ? `${selectedReceipt.amount} DZD` : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/30">
                                            <label className="text-[10px] text-blue-400 uppercase">Plan Price</label>
                                            <div className="text-blue-300 font-mono font-bold">
                                                {selectedPlan ? `${selectedPlan.price} DZD` : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-[10px] text-zinc-400 uppercase mb-1 block">Target Plan</label>
                                        <select
                                            value={selectedPlanId}
                                            onChange={(e) => setSelectedPlanId(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="" disabled>Select Plan...</option>
                                            {activePlans.map(plan => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} ({plan.price} DZD)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3">
                                <button
                                    onClick={() => setShowRejectDialog(true)}
                                    disabled={isProcessing}
                                    className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border border-red-500/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Reject
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing || !selectedPlanId}
                                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                                    Approve & Activate
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500">
                        Select a payment to review
                    </div>
                )}
            </div>

            {/* ZOOM MODAL */}
            {isZoomed && selectedReceipt?.receipt_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-8 backdrop-blur-sm"
                    onClick={() => setIsZoomed(false)}
                >
                    <img
                        src={selectedReceipt.receipt_url}
                        alt="Zoomed Receipt"
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                    <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
                        <X size={24} />
                    </button>
                </div>
            )}

            {/* REJECTION DIALOG */}
            {showRejectDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-2">Reject Payment</h3>
                        <p className="text-zinc-400 text-sm mb-4">Please provide a reason for the student.</p>

                        <textarea
                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500 focus:outline-none resize-none"
                            placeholder="Reason (e.g. Image blurry, Amount incorrect...)"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowRejectDialog(false)}
                                className="px-4 py-2 text-zinc-400 text-sm hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold"
                            >
                                {isProcessing ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

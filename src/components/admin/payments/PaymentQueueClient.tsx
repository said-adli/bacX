"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Calendar, User, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { SubscriptionCard } from "@/components/shared/SubscriptionCard";
import { approvePayment, rejectPayment, PaymentProof } from "@/actions/admin-payments";
import { getActivePlans, SubscriptionPlan } from "@/actions/admin-plans"; // [NEW]
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PaymentQueueItem {
    id: string;
    user_id: string;
    plan_id?: string;
    receipt_url?: string;
    created_at: string;
    profiles?: { full_name?: string; email?: string };
}

export default function PaymentQueueClient({ payments }: { payments: PaymentQueueItem[] }) {
    const router = useRouter();
    const [selectedReceipt, setSelectedReceipt] = useState<PaymentQueueItem | null>(null);
    const [activePlans, setActivePlans] = useState<SubscriptionPlan[]>([]); // [NEW]
    const [selectedPlanId, setSelectedPlanId] = useState<string>(""); // [NEW]
    const [isProcessing, setIsProcessing] = useState(false);

    // [NEW] Fetch Plans on Mount
    useEffect(() => {
        getActivePlans().then(setActivePlans).catch(console.error);
    }, []);

    // [NEW] Sync Plan ID when Receipt Selected
    useEffect(() => {
        if (selectedReceipt) {
            setSelectedPlanId(selectedReceipt.plan_id || "");
        }
    }, [selectedReceipt]);

    const handleApprove = async () => {
        if (!selectedReceipt) return;
        if (!confirm("Confirm activation for this student?")) return;

        setIsProcessing(true);
        try {
            if (!selectedPlanId) {
                toast.error("Please select a plan to assign.");
                setIsProcessing(false);
                return;
            }

            await approvePayment(selectedReceipt.id, selectedReceipt.user_id, selectedPlanId);
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
                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-wider">Pending ({payments.length})</h3>
                        <button
                            onClick={handleAutoVerify}
                            disabled={isVerifying || payments.length === 0}
                            className="text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                            Auto-Verify
                        </button>
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

                            <div className="w-full max-w-md mb-6">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Assign Plan</label>
                                <select
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="" disabled>Select Plan...</option>
                                    {activePlans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} ({plan.price} DZD)
                                        </option>
                                    ))}
                                </select>
                                {!selectedReceipt.plan_id && (
                                    <div className="flex items-center gap-2 mt-2 text-amber-500 text-xs">
                                        <AlertTriangle size={12} />
                                        <span>User did not select a plan. Please assign one manually.</span>
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
                                    disabled={isProcessing || !selectedPlanId}
                                    className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

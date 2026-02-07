"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getActivePlans, SubscriptionPlan } from "@/actions/admin-plans";
import { setStudentPlan } from "@/actions/admin-students";

interface ManageSubscriptionModalProps {
    student: {
        id: string;
        full_name: string | null;
        plan_id: string | null;
        is_subscribed: boolean;
    };
    onClose: () => void;
    onSuccess: () => void;
}

export function ManageSubscriptionModal({ student, onClose, onSuccess }: ManageSubscriptionModalProps) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedPlanId, setSelectedPlanId] = useState<string>(student.plan_id || "");
    const [isSubscribed, setIsSubscribed] = useState<boolean>(student.is_subscribed);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const data = await getActivePlans();
                setPlans(data);
                // If user has no plan but is subscribed (legacy hell), defaults might form here.
                // But for now we just show what is there.
            } catch (_err) {
                toast.error("Failed to load plans");
            } finally {
                setIsLoadingPlans(false);
            }
        };
        loadPlans();
    }, []);

    const handleSave = async () => {
        if (isSubscribed && !selectedPlanId) {
            toast.error("Please select a plan for active subscription");
            return;
        }

        setIsSaving(true);
        try {
            await setStudentPlan(student.id, selectedPlanId, isSubscribed);
            toast.success("Subscription updated");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0A0A15] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 rounded-t-2xl">
                    <h3 className="font-bold text-white">Manage Subscription</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-sm text-zinc-400">
                        Managing for: <b className="text-white">{student.full_name || "Unknown User"}</b>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-white font-medium">Subscription Status</span>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${isSubscribed ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                {isSubscribed ? "ACTIVE" : "INACTIVE"}
                            </span>
                            <button
                                onClick={() => setIsSubscribed(!isSubscribed)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${isSubscribed ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isSubscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Plan Selector */}
                    <div className={`space-y-2 ${!isSubscribed ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Assigned Plan</label>
                        {isLoadingPlans ? (
                            <div className="h-10 w-full bg-white/5 animate-pulse rounded-xl" />
                        ) : (
                            <select
                                value={selectedPlanId}
                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50"
                            >
                                <option value="" disabled>Select a plan...</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.price} DZD)
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-[10px] text-zinc-500">
                            Required when status is Active.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || (isSubscribed && !selectedPlanId)}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

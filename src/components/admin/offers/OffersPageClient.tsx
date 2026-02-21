"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SubscriptionCard } from "@/components/shared/SubscriptionCard";
import { createPlan, deletePlan, SubscriptionPlan } from "@/actions/admin-plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PlansPage({ plans }: { plans: SubscriptionPlan[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        type: 'subscription' as 'subscription' | 'course',
        duration_days: 30,
        features: [] as string[],
        featureInput: ""
    });

    const handleAddFeature = () => {
        if (!formData.featureInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, prev.featureInput],
            featureInput: ""
        }));
    };

    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        try {
            await createPlan({
                name: formData.name,
                price: Number(formData.price),
                features: formData.features,
                duration_days: Number(formData.duration_days),
                type: formData.type,
                is_active: true
            });
            toast.success("Plan created successfully");
            setIsCreating(false);
            setFormData({ name: "", price: 0, type: 'subscription', duration_days: 30, features: [], featureInput: "" });
            router.refresh();
        } catch (e) {
            toast.error("Failed to create plan");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this plan?")) return;
        try {
            await deletePlan(id);
            toast.success("Plan deleted");
            router.refresh();
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white">Offer Builder</h2>
                    <p className="text-zinc-500">Manage subscriptions and course access.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-full font-bold text-white shadow-lg hover:bg-blue-500 transition-all"
                >
                    <Plus size={20} /> New Plan
                </button>
            </div>

            {/* Creation Form (Collapsible) */}
            {isCreating && (
                <div className="mb-10 p-6 rounded-3xl bg-black/20 border border-blue-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">New Active Plan</h3>
                        <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Plan Name</label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. Monthly Premium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Price (DZD)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Duration (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        value={formData.duration_days}
                                        onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Plan Type</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'subscription' | 'course' })}
                                >
                                    <option value="subscription">Standard Subscription</option>
                                    <option value="course">Course (Manual Expiry)</option>
                                </select>
                            </div>

                            {/* Features Input */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Features</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        placeholder="Add a feature..."
                                        value={formData.featureInput}
                                        onChange={(e) => setFormData({ ...formData, featureInput: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                                    />
                                    <button onClick={handleAddFeature} className="px-4 bg-white/10 rounded-xl hover:bg-white/20"><Plus /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((f, i) => (
                                        <span key={i} className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs border border-blue-500/20">
                                            {f} <button onClick={() => handleRemoveFeature(i)}><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-zinc-500 mb-4 text-sm font-mono uppercase tracking-widest">Live Preview</p>
                            <div className="w-full max-w-[320px]">
                                <SubscriptionCard
                                    id="preview"
                                    name={formData.name || "Plan Name"}
                                    price={formData.price || 0}
                                    features={formData.features.length ? formData.features : ["Feature 1", "Feature 2"]}
                                    type={formData.type}
                                    duration_days={formData.duration_days}
                                    highlight={true}
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="mt-8 w-full max-w-[320px] py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
                            >
                                Publish Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <SubscriptionCard
                        key={plan.id}
                        {...plan}
                        isAdmin={true}
                        onDelete={() => handleDelete(plan.id)}
                    />
                ))}
            </div>
        </div>
    );
}

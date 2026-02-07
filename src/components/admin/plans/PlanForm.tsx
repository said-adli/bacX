"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";
import { createPlan, updatePlan, SubscriptionPlan } from "@/actions/admin-plans";
import { toast } from "sonner";

interface PlanFormProps {
    plan?: SubscriptionPlan | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function PlanForm({ plan, onClose, onSuccess }: PlanFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        discount_price: 0 as number | null,
        description: "",
        features: [] as string[],
        is_active: true,
        duration_days: 30,
        type: 'subscription' as 'subscription' | 'course'
    });

    // Feature Input State
    const [newFeature, setNewFeature] = useState("");

    // Initialize if editing
    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                price: plan.price,
                discount_price: plan.discount_price || null,
                description: plan.description || "",
                features: plan.features || [],
                is_active: plan.is_active,
                duration_days: plan.duration_days || 30, // Fallback default
                type: plan.type || 'subscription'
            });
        }
    }, [plan]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || formData.price < 0) {
            toast.error("Please fill in required fields correctly.");
            return;
        }

        setIsLoading(true);

        try {
            if (plan) {
                await updatePlan(plan.id, formData);
                toast.success("Plan updated successfully");
            } else {
                await createPlan(formData);
                toast.success("Plan created successfully");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Operation failed. check console.");
        } finally {
            setIsLoading(false);
        }
    };

    // Feature Management
    const addFeature = () => {
        if (!newFeature.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, newFeature.trim()]
        }));
        setNewFeature("");
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    return (
        <div>
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <h2 className="text-xl font-bold text-white">
                    {plan ? "Edit Plan" : "Create New Plan"}
                </h2>
                <button onClick={onClose} className="text-zinc-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Plan Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. VIP Subscription"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Price (DZD)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Discount Price (Optional)</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.discount_price || ''}
                            onChange={e => setFormData({ ...formData, discount_price: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Leave empty if none"
                        />
                    </div>
                </div>

                {/* Duration & Type */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Duration (Days)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.duration_days}
                            onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as 'subscription' | 'course' })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                        >
                            <option value="subscription">Subscription</option>
                            <option value="course">Course (One-time)</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Description</label>
                    <textarea
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                </div>

                {/* Features Builder */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Features List</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={e => setNewFeature(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl p-2 px-4 text-white text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Add a feature (e.g. 'Access to all courses')"
                        />
                        <button
                            type="button"
                            onClick={addFeature}
                            className="px-4 py-2 bg-blue-600/20 text-blue-400 font-bold rounded-xl border border-blue-500/30 hover:bg-blue-600/30"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                        {formData.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5 group">
                                <span className="text-sm text-zinc-300">{feat}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFeature(idx)}
                                    className="p-1 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {formData.features.length === 0 && (
                            <p className="text-zinc-600 text-sm italic">No features added yet.</p>
                        )}
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.is_active}
                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-white/20 bg-black/20 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-white font-medium cursor-pointer select-none">
                        Active (Visible to users)
                    </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-zinc-400 font-medium hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={18} />
                                {plan ? "Save Changes" : "Create Plan"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

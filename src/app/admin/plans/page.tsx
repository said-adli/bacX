"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, Package } from "lucide-react";
import { getAdminPlans, deletePlan, SubscriptionPlan } from "@/actions/admin-plans";
import { toast } from "sonner";
import { PlanForm } from "@/components/admin/plans/PlanForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/AlertDialog";

export default function PlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPlans = async () => {
        try {
            const data = await getAdminPlans();
            setPlans(data);
        } catch {
            toast.error("Failed to load plans");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleDelete = async () => {
        if (!planToDelete) return;
        setIsDeleting(true);
        try {
            await deletePlan(planToDelete);
            toast.success("Plan deleted successfully");
            fetchPlans();
        } catch {
            toast.error("Failed to delete plan");
        } finally {
            setIsDeleting(false);
            setPlanToDelete(null);
        }
    };

    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = () => {
        setIsFormOpen(false);
        fetchPlans();
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Subscription Plans</h1>
                    <p className="text-zinc-400">Manage pricing tiers and features</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Create Plan
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-zinc-500">Loading plans...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative group bg-black/20 border rounded-2xl p-6 transition-all hover:bg-white/5 ${plan.is_active ? 'border-white/10' : 'border-red-900/30 opacity-75'}`}
                        >
                            {!plan.is_active && (
                                <div className="absolute top-4 right-4 px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20">
                                    INACTIVE
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-blue-400">
                                        {plan.price.toLocaleString()} DZD
                                    </span>
                                    {plan.discount_price && (
                                        <span className="text-sm text-zinc-500 line-through">
                                            {plan.discount_price.toLocaleString()} DZD
                                        </span>
                                    )}
                                </div>
                                <p className="text-zinc-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                                    {plan.description || "No description provided."}
                                </p>
                            </div>

                            <div className="space-y-2 mb-6 border-t border-white/5 pt-4">
                                {plan.features.slice(0, 3).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                        <span className="truncate">{feature}</span>
                                    </div>
                                ))}
                                {plan.features.length > 3 && (
                                    <div className="text-xs text-zinc-500 pl-6">
                                        +{plan.features.length - 3} more features
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setPlanToDelete(plan.id)}
                                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                    title="Delete Plan"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Empty State (if no plans) */}
                    {plans.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-black/10">
                            <Package size={48} className="mb-4 opacity-20" />
                            <p>No subscription plans found.</p>
                            <button onClick={handleCreate} className="mt-4 text-blue-400 hover:text-blue-300 font-medium">
                                Create your first plan
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-[#0A0A15] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <PlanForm
                            plan={editingPlan}
                            onClose={() => setIsFormOpen(false)}
                            onSuccess={handleFormSubmit}
                        />
                    </div>
                </div>
            )}

            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this subscription plan? This action cannot be undone if users are linked to it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">
                            {isDeleting ? "Deleting..." : "Delete Plan"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

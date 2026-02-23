"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SubscriptionCard } from "@/components/shared/SubscriptionCard";
import { createPlan, deletePlan, SubscriptionPlan } from "@/actions/admin-plans";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";

const planSchema = z.object({
    name: z.string().min(1, "Plan Name is required"),
    price: z.number().min(0, "Price must be at least 0"),
    type: z.enum(["subscription", "course"]),
    duration_days: z.number().min(1, "Duration must be at least 1 day"),
    features: z.array(z.string()).min(1, "At least one feature is required")
});

type PlanFormValues = z.infer<typeof planSchema>;

export default function PlansPage({ plans }: { plans: SubscriptionPlan[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [featureInput, setFeatureInput] = useState("");
    const [planToDelete, setPlanToDelete] = useState<string | null>(null);

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: "",
            price: 0,
            type: "subscription",
            duration_days: 30,
            features: []
        }
    });

    const watchFeatures = form.watch("features");

    const handleAddFeature = () => {
        if (!featureInput.trim()) return;
        form.setValue("features", [...watchFeatures, featureInput.trim()]);
        setFeatureInput("");
    };

    const handleRemoveFeature = (index: number) => {
        form.setValue("features", watchFeatures.filter((_, i) => i !== index));
    };

    const onSubmit = async (values: PlanFormValues) => {
        try {
            await createPlan({
                name: values.name,
                price: values.price,
                features: values.features,
                duration_days: values.duration_days,
                type: values.type,
                is_active: true
            });
            toast.success("Plan created successfully");
            setIsCreating(false);
            form.reset();
            router.refresh();
        } catch (e) {
            toast.error("Failed to create plan");
        }
    };

    const handleDelete = async () => {
        if (!planToDelete) return;
        try {
            await deletePlan(planToDelete);
            toast.success("Plan deleted");
            setPlanToDelete(null);
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

                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Form Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Plan Name</label>
                                <input
                                    {...form.register("name")}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    placeholder="e.g. Monthly Premium"
                                />
                                {form.formState.errors.name && <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Price (DZD)</label>
                                    <input
                                        type="number"
                                        {...form.register("price", { valueAsNumber: true })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    />
                                    {form.formState.errors.price && <span className="text-xs text-red-500">{form.formState.errors.price.message}</span>}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Duration (Days)</label>
                                    <input
                                        type="number"
                                        {...form.register("duration_days", { valueAsNumber: true })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                    />
                                    {form.formState.errors.duration_days && <span className="text-xs text-red-500">{form.formState.errors.duration_days.message}</span>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Plan Type</label>
                                <select
                                    {...form.register("type")}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                >
                                    <option value="subscription">Standard Subscription</option>
                                    <option value="course">Course (Manual Expiry)</option>
                                </select>
                                {form.formState.errors.type && <span className="text-xs text-red-500">{form.formState.errors.type.message}</span>}
                            </div>

                            {/* Features Input */}
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Features</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                        placeholder="Add a feature..."
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddFeature();
                                            }
                                        }}
                                    />
                                    <button type="button" onClick={handleAddFeature} className="px-4 bg-white/10 rounded-xl hover:bg-white/20"><Plus /></button>
                                </div>
                                {form.formState.errors.features && <span className="text-xs text-red-500 block mb-2">{form.formState.errors.features.message}</span>}
                                <div className="flex flex-wrap gap-2">
                                    {watchFeatures.map((f, i) => (
                                        <span key={i} className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs border border-blue-500/20">
                                            {f} <button type="button" onClick={() => handleRemoveFeature(i)}><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-3xl border border-white/5 border-dashed">
                            <p className="text-zinc-500 mb-4 text-sm font-mono uppercase tracking-widest">Live Preview</p>
                            <div className="w-full max-w-[320px] pointer-events-none">
                                <SubscriptionCard
                                    id="preview"
                                    name={form.watch("name") || "Plan Name"}
                                    price={form.watch("price") || 0}
                                    features={watchFeatures.length ? watchFeatures : ["Feature 1", "Feature 2"]}
                                    type={form.watch("type")}
                                    duration_days={form.watch("duration_days")}
                                    highlight={true}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="mt-8 w-full max-w-[320px] py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                            >
                                {form.formState.isSubmitting ? "Publishing..." : "Publish Plan"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="relative group">
                        <div className="pointer-events-none">
                            <SubscriptionCard
                                {...plan}
                                highlight={false}
                            />
                        </div>
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setPlanToDelete(plan.id)}
                                className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-600 shadow-xl"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Modal */}
            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this subscription plan? This will remove it from the store forever.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Yes, Default</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

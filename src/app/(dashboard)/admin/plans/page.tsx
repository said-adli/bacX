"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutGrid, Plus, Trash2, Edit2,
    Check, X, DollarSign, Tag, List
} from "lucide-react";
import { toast } from "sonner";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { getAdminPlans, createPlan, updatePlan, deletePlan, SubscriptionPlan } from "@/actions/admin-plans";

export default function PlansManagerPage() {
    const isVisible = usePageVisibility();
    const { role } = useAuth();

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        if (role === "admin") {
            loadPlans();
        }
    }, [role]);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const data = await getAdminPlans();
            setPlans(data);
        } catch (error) {
            toast.error("فشل في تحميل الخطط");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const planData = {
            name: formData.get("name") as string,
            price: Number(formData.get("price")),
            discount_price: formData.get("discount_price") ? Number(formData.get("discount_price")) : null,
            description: formData.get("description") as string,
            features: (formData.get("features") as string).split('\n').filter(f => f.trim() !== "")
        };

        try {
            if (editingPlan) {
                await updatePlan(editingPlan.id, planData);
                toast.success("تم تحديث الخطة بنجاح");
            } else {
                await createPlan(planData);
                toast.success("تم إنشاء الخطة بنجاح");
            }
            setIsFormOpen(false);
            setEditingPlan(null);
            loadPlans();
        } catch (error) {
            toast.error("حدث خطأ أثناء الحفظ");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`هل أنت متأكد من حذف الخطة "${name}"؟`)) return;
        try {
            await deletePlan(id);
            toast.success("تم الحذف بنجاح");
            loadPlans();
        } catch (error) {
            toast.error("فشل الحذف");
        }
    };

    const handleToggleActive = async (plan: SubscriptionPlan) => {
        try {
            await updatePlan(plan.id, { is_active: !plan.is_active });
            toast.success(plan.is_active ? "تم تعطيل الخطة" : "تم تفعيل الخطة");
            loadPlans();
        } catch (error) {
            toast.error("فشل التحديث");
        }
    };

    if (role !== "admin") return <div className="p-10 text-center text-white/50">Access Denied</div>;

    return (
        <div className={`space-y-6 animate-in fade-in zoom-in duration-500 pb-20 ${!isVisible ? "animations-paused" : ""}`}>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white font-serif flex items-center gap-3">
                    <LayoutGrid className="text-green-400" />
                    إدارة خطط الاشتراك
                </h1>
                <button
                    onClick={() => {
                        setEditingPlan(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all"
                >
                    <Plus size={18} />
                    خطة جديدة
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <GlassCard key={plan.id} className={`p-6 relative group border ${plan.is_active ? 'border-primary/20' : 'border-red-500/20 opacity-70'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-bold text-white">{plan.discount_price || plan.price} دج</span>
                                    {plan.discount_price && (
                                        <span className="text-sm text-white/40 line-through">{plan.price} دج</span>
                                    )}
                                </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${plan.is_active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
                        </div>

                        <p className="text-white/60 text-sm mb-4 min-h-[40px]">{plan.description}</p>

                        <div className="space-y-2 mb-6">
                            {(plan.features || []).slice(0, 3).map((feat, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                                    <Check size={12} className="text-green-400" />
                                    {feat}
                                </div>
                            ))}
                            {(plan.features || []).length > 3 && (
                                <div className="text-xs text-white/30 italic">+{plan.features.length - 3} ميزات أخرى</div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-white/5">
                            <button
                                onClick={() => {
                                    setEditingPlan(plan);
                                    setIsFormOpen(true);
                                }}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <Edit2 size={14} />
                                تعديل
                            </button>
                            <button
                                onClick={() => handleToggleActive(plan)}
                                className={`p-2 rounded-lg ${plan.is_active ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                                title={plan.is_active ? "تعطيل" : "تفعيل"}
                            >
                                {plan.is_active ? <X size={16} /> : <Check size={16} />}
                            </button>
                            <button
                                onClick={() => handleDelete(plan.id, plan.name)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                                title="حذف نهائي"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsFormOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingPlan ? "تعديل الخطة" : "إضافة خطة جديدة"}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-white/60 mb-1">اسم الباقة</label>
                                <div className="relative">
                                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                    <input
                                        name="name"
                                        defaultValue={editingPlan?.name}
                                        placeholder="مثال: الباقة الذهبية"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pr-10 pl-3 py-3 text-white focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">السعر الأصلي</label>
                                    <div className="relative">
                                        <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                        <input
                                            name="price"
                                            type="number"
                                            defaultValue={editingPlan?.price}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg pr-10 pl-3 py-3 text-white focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">سعر العرض (اختياري)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                        <input
                                            name="discount_price"
                                            type="number"
                                            defaultValue={editingPlan?.discount_price || ""}
                                            placeholder="فراغ = لا يوجد خصم"
                                            className="w-full bg-black/40 border border-white/10 rounded-lg pr-10 pl-3 py-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1">وصف قصير</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingPlan?.description}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-1">الميزات (كل ميزة في سطر)</label>
                                <div className="relative">
                                    <List className="absolute right-3 top-3 text-white/30" size={16} />
                                    <textarea
                                        name="features"
                                        defaultValue={editingPlan?.features?.join('\n')}
                                        placeholder="- وصول كامل&#10;- دعم مباشر&#10;- بنك التمارين"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg pr-10 pl-3 py-3 text-white focus:outline-none focus:border-blue-500 h-32"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20"
                                >
                                    حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}

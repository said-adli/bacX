"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { createPlan, updatePlan, deletePlan, togglePlanStatus } from "@/actions/plans";
import { toast } from "sonner";
import { Loader2, Trash2, Tag, Check, X, Pencil, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
    id: string;
    title: string;
    price: string;
    durationDays: number;
    features: string[];
    isActive: boolean;
    isPopular?: boolean;
}

export default function PlanManager() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Plan>>({
        title: "",
        price: "",
        durationDays: 365,
        features: [""],
        isActive: true,
        isPopular: false
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchPlans = async () => {
            const { data } = await supabase.from('plans').select('*').order('price', { ascending: true });
            if (data) {
                const mapped = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    price: d.price,
                    durationDays: d.duration_days,
                    features: d.features,
                    isActive: d.is_active,
                    isPopular: d.is_popular
                }));
                setPlans(mapped);
            }
            setLoading(false);
        };
        fetchPlans();
    }, []);

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...(formData.features || []), ""] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const populateForm = (plan: Plan) => {
        setEditId(plan.id);
        setFormData({
            title: plan.title,
            price: plan.price,
            durationDays: plan.durationDays || 365,
            features: plan.features,
            isActive: plan.isActive,
            isPopular: plan.isPopular
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.price) return;

        setIsSubmitting(true);
        try {
            const cleanFeatures = formData.features?.filter(f => f.trim() !== "") || [];
            const payload = { ...formData, features: cleanFeatures };

            let result;
            if (editId) {
                result = await updatePlan(editId, payload);
            } else {
                result = await createPlan(payload);
            }

            if (result.success) {
                toast.success(editId ? "تم تحديث العرض بنجاح" : "تم إضافة العرض بنجاح");
                // Refresh list logic would technically re-fetch or optimistically update. 
                // For simplicity, re-fetch or manual update.
                // manual update:
                setPlans(prev => {
                    if (editId) {
                        return prev.map(p => p.id === editId ? { ...p, ...payload } as Plan : p);
                    } else {
                        // Create logic needs ID from DB, so refetching is safer.
                        // Or just reload page / invoke fetch
                        return prev;
                    }
                });
                // Ideally trigger re-fetch.
            } else {
                toast.error("فشل الحفظ: " + result.message);
            }

            setFormData({ title: "", price: "", durationDays: 365, features: [""], isActive: true, isPopular: false });
            setEditId(null);
        } catch {
            toast.error("فشل الحفظ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("تأكيد الحذف؟")) return;
        try {
            const result = await deletePlan(id);
            if (result.success) {
                setPlans(plans.filter(p => p.id !== id));
                toast.success("تم الحذف");
            } else {
                toast.error("خطأ: " + result.message);
            }
        } catch {
            toast.error("خطأ");
        }
    };

    const toggleStatus = async (plan: Plan) => {
        try {
            const result = await togglePlanStatus(plan.id, plan.isActive);
            if (result.success) {
                setPlans(plans.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p));
                toast.success("تم تحديث الحالة");
            } else {
                toast.error("خطأ: " + result.message);
            }
        } catch {
            toast.error("خطأ");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Tag className="w-8 h-8 text-yellow-500" />
                إدارة برامج الاشتراك
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CREATE / EDIT FORM */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 h-fit order-2 md:order-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{editId ? "تعديل العرض" : "إضافة عرض جديد"}</h2>
                        {editId && (
                            <button
                                onClick={() => { setEditId(null); setFormData({ title: "", price: "", durationDays: 365, features: [""], isActive: true, isPopular: false }); }}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                إلغاء التعديل
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 font-bold mb-1 block">عنوان العرض</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="مثال: الباقة الذهبية"
                                className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 font-bold mb-1 block">السعر (DZD)</label>
                                <input
                                    required
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="مثال: 4500"
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 font-bold mb-1 block">المدة (أيام)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.durationDays}
                                    onChange={e => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 0 })}
                                    placeholder="365"
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 font-bold mb-1 block">المميزات</label>
                            <div className="space-y-2">
                                {formData.features?.map((feat, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            value={feat}
                                            onChange={e => handleFeatureChange(i, e.target.value)}
                                            placeholder={`ميزة ${i + 1}`}
                                            className="flex-1 bg-black border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-blue-500"
                                        />
                                        {i > 0 && <button type="button" onClick={() => removeFeature(i)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><X className="w-4 h-4" /></button>}
                                    </div>
                                ))}
                                <button type="button" onClick={addFeature} className="text-xs text-blue-500 font-bold hover:underline">+ إضافة ميزة</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                                <span className="text-sm">نشط</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({ ...formData, isPopular: e.target.checked })} />
                                <span className="text-sm">الأكثر طلباً (Popular)</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full py-3 font-bold rounded-xl transition-colors flex justify-center items-center gap-2",
                                editId ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-white text-black hover:bg-zinc-200"
                            )}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editId ? "تحديث العرض" : "حفظ العرض"}
                        </button>
                    </form>
                </div>

                {/* LIST */}
                <div className="space-y-4 order-1 md:order-2">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xl">{plan.title}</h3>
                                        {plan.isPopular && <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded-full">الأكثر طلباً</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="text-2xl font-bold text-blue-400">{plan.price} <span className="text-sm text-zinc-500">DZD</span></div>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">
                                            <Clock className="w-3 h-3" /> {plan.durationDays || 365} يوم
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => populateForm(plan)} className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-green-500" /> {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => toggleStatus(plan)}
                                className={cn(
                                    "w-full py-2 rounded-xl text-sm font-bold border transition-colors",
                                    plan.isActive ? "border-green-500/20 text-green-500 bg-green-500/5" : "border-red-500/20 text-red-500 bg-red-500/5"
                                )}
                            >
                                {plan.isActive ? "نشط (معروض للطلاب)" : "غير نشط (مخفي)"}
                            </button>
                        </div>
                    ))}
                    {plans.length === 0 && !loading && (
                        <div className="text-center p-8 text-zinc-500 border border-dashed border-white/10 rounded-2xl">لا توجد عروض</div>
                    )}
                </div>
            </div>
        </div>
    );
}

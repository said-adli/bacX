"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Tag, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
    id: string;
    title: string;
    price: string;
    features: string[];
    isActive: boolean;
    isPopular?: boolean;
}

export default function PlanManager() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Plan>>({
        title: "",
        price: "",
        features: [""],
        isActive: true,
        isPopular: false
    });

    useEffect(() => {
        const q = query(collection(db, "plans"), orderBy("price", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
            setLoading(false);
        });
        return () => unsubscribe();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.price) return;

        setIsEditing(true);
        try {
            // Clean empty features
            const cleanFeatures = formData.features?.filter(f => f.trim() !== "") || [];

            await addDoc(collection(db, "plans"), {
                ...formData,
                features: cleanFeatures,
                createdAt: new Date()
            });
            toast.success("تم إضافة العرض بنجاح");
            setFormData({ title: "", price: "", features: [""], isActive: true, isPopular: false });
        } catch (error) {
            toast.error("فشل الحفظ");
        } finally {
            setIsEditing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("تأكيد الحذف؟")) return;
        try {
            await deleteDoc(doc(db, "plans", id));
            toast.success("تم الحذف");
        } catch {
            toast.error("خطأ");
        }
    };

    const toggleStatus = async (plan: Plan) => {
        try {
            await updateDoc(doc(db, "plans", plan.id), { isActive: !plan.isActive });
            toast.success("تم تحديث الحالة");
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
                {/* LIST */}
                <div className="space-y-4">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-xl">{plan.title}</h3>
                                        {plan.isPopular && <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded-full">الأكثر طلباً</span>}
                                    </div>
                                    <div className="text-2xl font-bold text-blue-400 mt-1">{plan.price} <span className="text-sm text-zinc-500">DZD</span></div>
                                </div>
                                <button onClick={() => handleDelete(plan.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
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

                {/* CREATE FORM */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 h-fit">
                    <h2 className="text-xl font-bold mb-6">إضافة عرض جديد</h2>
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
                        <div>
                            <label className="text-xs text-zinc-500 font-bold mb-1 block">السعر</label>
                            <input
                                required
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="مثال: 4500"
                                className="w-full bg-black border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500"
                            />
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
                            disabled={isEditing}
                            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                            {isEditing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "حفظ العرض"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

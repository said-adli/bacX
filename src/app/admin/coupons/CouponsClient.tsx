"use client";

import { useState } from "react";
import { Coupon, createCoupon, deleteCoupon } from "@/actions/coupons";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Trash2, Tag, Calendar, Users, Percent, DollarSign, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusToggle } from "@/components/admin/shared/StatusToggle";

interface CouponsClientProps {
    initialCoupons: Coupon[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: "",
        discount_type: "percent",
        value: 0,
        max_uses: 100,
        expires_at: null,
        is_active: true
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createCoupon(formData);
            toast.success("تم إنشاء القسيمة بنجاح");
            setIsCreateOpen(false);
            setFormData({
                code: "",
                discount_type: "percent",
                value: 0,
                max_uses: 100,
                expires_at: null,
                is_active: true
            });
            router.refresh();
        } catch (error: any) {
            toast.error("فشل إنشاء القسيمة: " + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه القسيمة؟")) return;
        setIsDeleting(id);
        try {
            await deleteCoupon(id);
            toast.success("تم حذف القسيمة");
            router.refresh();
        } catch (error: any) {
            toast.error("فشل الحذف: " + error.message);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-bold">
                            <Plus size={18} />
                            <span>إضافة قسيمة جديدة</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة قسيمة جديدة</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">الكود</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500 uppercase font-mono"
                                    placeholder="SUMMER2026"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">نوع الخصم</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500"
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                    >
                                        <option value="percent">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (DA)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">القيمة</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">الحد الأقصى للاستخدام</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">تاريخ الانتهاء (اختياري)</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500 icon-white"
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                                إنشاء القسيمة
                            </button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Coupons List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialCoupons.map((coupon) => (
                    <GlassCard key={coupon.id} className="p-5 flex flex-col justify-between group relative overflow-hidden">
                        {/* Status Stripe - Kept for quick visual, though toggle also shows status */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-red-500/50'}`} />

                        <div>
                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Tag className="w-4 h-4 text-zinc-400" />
                                        <h3 className="text-xl font-bold font-mono tracking-wider text-white">{coupon.code}</h3>
                                    </div>
                                    <p className="text-sm text-zinc-400">
                                        {coupon.discount_type === 'percent' ? `${coupon.value}% خصم` : `${coupon.value} دج خصم`}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        disabled={!!isDeleting}
                                        className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        {isDeleting === coupon.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 mt-2 border-t border-white/5 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <Users size={12} />
                                    <span>{coupon.used_count} / {coupon.max_uses}</span>
                                </div>
                                {coupon.expires_at && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        <span>{new Date(coupon.expires_at).toLocaleDateString('en-GB')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-zinc-500 font-bold">الحالة:</span>
                                <StatusToggle
                                    table="coupons"
                                    id={coupon.id}
                                    field="is_active"
                                    initialValue={coupon.is_active}
                                    labelActive="نشط"
                                    labelInactive="غير نشط"
                                />
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {initialCoupons.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>لا توجد قسائم حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
}

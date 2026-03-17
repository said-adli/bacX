"use client";

import { useState } from "react";
import { Coupon, createCoupon, deleteCoupon } from "@/actions/coupons";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Trash2, Tag, Calendar, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusToggle } from "@/components/admin/shared/StatusToggle";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/AlertDialog";

const couponSchema = z.object({
    code: z.string().min(3, "يجب أن يتكون الكود من 3 أحرف على الأقل").max(20, "الكود طويل جداً").transform(val => val.trim().toUpperCase()),
    discount_type: z.enum(["percent", "fixed"]),
    value: z.number().min(0, "لا يمكن أن تكون القيمة سالبة"),
    max_uses: z.number().min(1, "يجب أن يكون الحد الأقصى للاستخدام 1 على الأقل"),
    expires_at: z.string().nullable(),
    is_active: z.boolean(),
    is_lifetime: z.boolean().optional()
}).refine(data => {
    if (data.expires_at) {
        const date = new Date(data.expires_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        return date >= today;
    }
    return true;
}, {
    message: "لا يمكن أن يكون تاريخ الانتهاء في الماضي",
    path: ["expires_at"]
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponsClientProps {
    initialCoupons: Coupon[];
}

export function CouponsClient({ initialCoupons }: CouponsClientProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            discount_type: "percent",
            value: 0,
            max_uses: 100,
            expires_at: null,
            is_active: true,
            is_lifetime: false
        }
    });

    const onSubmit = async (values: CouponFormValues) => {
        try {
            // Need to map values to Partial<Coupon> to match action 
            await createCoupon({
                ...values,
                expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : null
            });
            toast.success("تم إنشاء القسيمة بنجاح");
            setIsCreateOpen(false);
            form.reset();
            router.refresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error("فشل إنشاء القسيمة: " + errorMessage);
        }
    };

    const handleDelete = async () => {
        if (!couponToDelete) return;
        setIsDeleting(couponToDelete);
        try {
            await deleteCoupon(couponToDelete);
            toast.success("تم حذف القسيمة");
            router.refresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error("فشل الحذف: " + errorMessage);
        } finally {
            setIsDeleting(null);
            setCouponToDelete(null);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) form.reset();
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={handleOpenChange}>
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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">الكود</label>
                                <input
                                    type="text"
                                    {...form.register("code")}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500 uppercase font-mono"
                                    placeholder="SUMMER2026"
                                />
                                {form.formState.errors.code && <span className="text-xs text-red-500">{form.formState.errors.code.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">نوع الخصم</label>
                                    <select
                                        {...form.register("discount_type")}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="percent">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (DA)</option>
                                    </select>
                                    {form.formState.errors.discount_type && <span className="text-xs text-red-500">{form.formState.errors.discount_type.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">القيمة</label>
                                    <input
                                        type="number"
                                        {...form.register("value", { valueAsNumber: true })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500"
                                    />
                                    {form.formState.errors.value && <span className="text-xs text-red-500">{form.formState.errors.value.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">الحد الأقصى للاستخدام</label>
                                    <input
                                        type="number"
                                        {...form.register("max_uses", { valueAsNumber: true })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500"
                                    />
                                    {form.formState.errors.max_uses && <span className="text-xs text-red-500">{form.formState.errors.max_uses.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">تاريخ الانتهاء (اختياري)</label>
                                    <input
                                        type="date"
                                        {...form.register("expires_at")}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/90 focus:outline-none focus:border-blue-500 icon-white"
                                    />
                                    {form.formState.errors.expires_at && <span className="text-xs text-red-500">{form.formState.errors.expires_at.message}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                <input
                                    type="checkbox"
                                    id="is_lifetime"
                                    {...form.register("is_lifetime")}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_lifetime" className="text-sm font-bold text-white cursor-pointer select-none">
                                    دخول مدى الحياة (Lifetime Access)
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
                        <div className={`absolute top-0 left-0 w-1 h-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-red-500/50'}`} />

                        <div>
                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Tag className="w-4 h-4 text-zinc-400" />
                                        <h3 className="text-xl font-bold font-mono tracking-wider text-white">{coupon.code}</h3>
                                        {coupon.is_lifetime && (
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] border border-indigo-500/30 font-bold">
                                                LIFETIME
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-400">
                                        {coupon.discount_type === 'percent' ? `${coupon.value}% خصم` : `${coupon.value} دج خصم`}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <button
                                        onClick={() => setCouponToDelete(coupon.id)}
                                        disabled={isDeleting === coupon.id}
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

            {/* Global Delete Modal */}
            <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف القسيمة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف هذه القسيمة؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCouponToDelete(null)}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white">
                            تأكيد الحذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


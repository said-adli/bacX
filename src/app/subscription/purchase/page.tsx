"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Upload, CheckCircle, Smartphone, Landmark, Loader2, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Plan {
    id: string;
    title: string;
    price: string;
    durationDays: number;
    features: string[];
    isPopular: boolean;
}

// Static Plans for now (or fetch from DB if you create a plans table)
const STATIC_PLANS: Plan[] = [
    {
        id: "annual",
        title: "الباقة السنوية",
        price: "2500",
        durationDays: 365,
        features: ["جميع المواد", "دروس مباشرة", "مكتبة الملخصات", "دعم فني 24/7"],
        isPopular: true
    },
    {
        id: "trimester",
        title: "باقة الفصل",
        price: "1000",
        durationDays: 90,
        features: ["جميع المواد", "دروس فصلية"],
        isPopular: false
    }
];

export default function PurchasePage() {
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [selectedMethod, setSelectedMethod] = useState<"CCP" | "BaridiMob">("CCP");

    // Plans State
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [plans, setPlans] = useState<Plan[]>(STATIC_PLANS);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>("annual");
    // const [loadingPlans, setLoadingPlans] = useState(false); // Warn: Unused

    // Upload State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    // const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Warn: Unused

    const methods = {
        CCP: {
            title: "DZD (CCP)",
            icon: Landmark,
            details: "CCP: 0000000000 00 | CLE: 00 | NOM: BRAINY EDTECH"
        },
        BaridiMob: {
            title: "BaridiMob",
            icon: Smartphone,
            details: "RIP: 00799999000000000000 | NOM: BRAINY EDTECH"
        }
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast.error("يرجى رفع صورة أو ملف PDF فقط");
            return;
        }

        if (file && file.size > 1 * 1024 * 1024) {
            toast.error("حجم الملف كبير جداً (الحد الأقصى 1 ميغابايت)");
            return;
        }

        setReceiptFile(file);

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            // reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            // setPreviewUrl(null);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }
        if (!receiptFile) {
            toast.error("يرجى إرفاق صورة الوصل");
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedPlan = plans.find(p => p.id === selectedPlanId);
            const amount = selectedPlan ? `${selectedPlan.price} DZD` : "Unknown";

            // 1. UPLOAD TO SUPABASE STORAGE
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, receiptFile);

            if (uploadError) throw new Error("Upload failed: " + uploadError.message);

            // Get Public URL (if public) or just store the path
            // Better: Store the full path or public URL.
            const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath);

            // 2. INSERT INTO PAYMENTS TABLE
            const { error: dbError } = await supabase
                .from('payments')
                .insert({
                    user_id: user.id,
                    full_name: user.email, // Or user_metadata.full_name
                    amount: amount,
                    plan_id: selectedPlanId,
                    method: selectedMethod,
                    receipt_url: publicUrl,
                    status: 'pending'
                });

            if (dbError) throw new Error("Database insert failed: " + dbError.message);

            // 3. SUCCESS
            toast.success("تم إرسال طلب الاشتراك بنجاح!", {
                description: "سيتم مراجعة طلبك خلال 24 ساعة."
            });

            router.push("/dashboard"); // Redirect to dashboard or subscription page

        } catch (error: unknown) {
            console.error("Submit error:", error);
            const msg = error instanceof Error ? error.message : "Error";
            toast.error("فشل إرسال الطلب", { description: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center font-tajawal direction-rtl text-slate-900 pt-24">
            <div className="max-w-3xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">تجديد الاشتراك</h1>

                {/* PLANS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {plans.map(plan => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedPlanId === plan.id
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-transparent bg-slate-50 hover:bg-slate-100"
                                }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-3 right-4 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <Crown className="w-3 h-3" /> الأكثر طلباً
                                </div>
                            )}
                            <h3 className="font-bold text-lg mb-2">{plan.title}</h3>
                            <div className="text-2xl font-bold text-blue-600 mb-2">{plan.price} <span className="text-sm text-slate-500">DZD</span></div>
                        </div>
                    ))}
                </div>

                {/* PAYMENT METHOD */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-2">طريقة الدفع</label>
                    <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(methods) as Array<"CCP" | "BaridiMob">).map((method) => (
                            <button
                                key={method}
                                onClick={() => setSelectedMethod(method)}
                                disabled={isSubmitting}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedMethod === method
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-slate-500 border-slate-200"
                                    }`}
                            >
                                <span className="font-bold">{methods[method].title}</span>
                            </button>
                        ))}
                    </div>

                    {/* UPLOAD */}
                    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${receiptFile
                        ? "border-green-400 bg-green-50/50"
                        : "border-slate-300 hover:bg-slate-50"
                        }`}>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                        />
                        {receiptFile ? (
                            <div>
                                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                <p className="font-bold text-green-700">{receiptFile.name}</p>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-500">ارفع صورة الوصل</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !receiptFile}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "إرسال الطلب"}
                    </button>
                </div>
            </div>
        </div>
    );
}

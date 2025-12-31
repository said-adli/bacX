"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Upload, CheckCircle, Smartphone, Landmark, Loader2, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Plan {
    id: string;
    title: string;
    price: string;
    durationDays: number;
    features: string[];
    isPopular: boolean;
}

export default function PurchasePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<"CCP" | "BaridiMob">("CCP");

    // Plans State
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [loadingPlans, setLoadingPlans] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

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

    // Fetch Active Plans
    useEffect(() => {
        async function fetchPlans() {
            try {
                const q = query(collection(db, "plans"), where("isActive", "==", true), orderBy("price", "asc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
                setPlans(data);
                // Default to first 'popular' plan or first plan
                if (data.length > 0) {
                    const defaultPlan = data.find(p => p.isPopular) || data[0];
                    setSelectedPlanId(defaultPlan.id);
                }
            } catch (err) {
                console.error("Error fetching plans", err);
                toast.error("فشل تحميل الباقات");
            } finally {
                setLoadingPlans(false);
            }
        }
        fetchPlans();
    }, []);

    const handleSubmit = async () => {
        if (!user) return;
        if (!receiptFile) return toast.error("يرجى إرفاق صورة الوصل");
        if (!selectedPlanId) return toast.error("يرجى اختيار باقة");

        setIsSubmitting(true);
        try {
            const selectedPlan = plans.find(p => p.id === selectedPlanId);
            const amount = selectedPlan ? `${selectedPlan.price} DZD` : "Unknown Amount";

            // Mock Upload
            const mockReceiptUrl = "https://fake-url.com/receipt.jpg";

            await addDoc(collection(db, "payments"), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                amount: amount,
                planId: selectedPlanId, // Vital for expiry logic
                planTitle: selectedPlan?.title || "Unknown Plan",
                method: selectedMethod,
                receiptUrl: mockReceiptUrl,
                status: "pending",
                createdAt: new Date()
            });

            toast.success("تم إرسال طلب التجديد بنجاح! سيتم مراجعته قريباً.");
            router.push("/subscription");
        } catch (error) {
            console.error(error);
            toast.error("حدث خطأ أثناء الإرسال");
        } finally {
            setIsSubmitting(false);
        }
    };

    // const selectedPlan = plans.find(p => p.id === selectedPlanId);

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center font-tajawal direction-rtl text-slate-900">
            <div className="max-w-3xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">تجديد الاشتراك</h1>

                {/* 1. PLANS SELECTION */}
                {loadingPlans ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                ) : (
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
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{plan.title}</h3>
                                    {selectedPlanId === plan.id && <CheckCircle className="w-6 h-6 text-blue-500" />}
                                </div>
                                <div className="text-2xl font-bold text-blue-600 mb-2">{plan.price} <span className="text-sm text-slate-500">DZD</span></div>
                                <div className="text-xs text-slate-500 mb-4">{plan.durationDays || 365} يوم</div>
                                <ul className="space-y-1">
                                    {plan.features.slice(0, 3).map((f, i) => (
                                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                                            <div className="w-1 h-1 bg-slate-400 rounded-full" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. PAYMENT & UPLOAD */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">طريقة الدفع</label>
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(methods) as Array<"CCP" | "BaridiMob">).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setSelectedMethod(method)}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedMethod === method
                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="p-2 bg-white/10 rounded-lg">
                                        {method === 'CCP' ? <Landmark className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                                    </span>
                                    <span className="font-bold">{methods[method].title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center">
                        <p className="text-sm text-slate-500 mb-2">معلومات الدفع:</p>
                        <p className="font-mono text-lg font-bold text-slate-800 dir-ltr">{methods[selectedMethod].details}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">إرفاق وصل الدفع</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            />
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                            <p className="text-sm text-slate-500">
                                {receiptFile ? <span className="text-green-600 font-bold">{receiptFile.name}</span> : "اضغط هنا لرفع صورة الوصل"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال الطلب"}
                    </button>

                    <Link href="/subscription" className="block text-center text-sm text-slate-400 hover:text-slate-600">
                        إلغاء والعودة
                    </Link>
                </div>
            </div>
        </div>
    );
}

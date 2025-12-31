"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { Upload, CheckCircle, Smartphone, Landmark, Loader2, Crown, AlertCircle, ImageIcon } from "lucide-react";
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

    // Upload State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    // Handle file selection with preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        // Validate file type
        if (file && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast.error("يرجى رفع صورة أو ملف PDF فقط");
            return;
        }

        // Validate file size (max 1MB as per storage.rules)
        if (file && file.size > 1 * 1024 * 1024) {
            toast.error("حجم الملف كبير جداً (الحد الأقصى 1 ميغابايت)");
            return;
        }

        setReceiptFile(file);

        // Create preview for images
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
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
        if (!selectedPlanId) {
            toast.error("يرجى اختيار باقة");
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const selectedPlan = plans.find(p => p.id === selectedPlanId);
            const amount = selectedPlan ? `${selectedPlan.price} DZD` : "Unknown Amount";

            // 1. UPLOAD TO FIREBASE STORAGE
            const timestamp = Date.now();
            const fileExtension = receiptFile.name.split('.').pop() || 'jpg';
            const fileName = `${user.uid}_${timestamp}.${fileExtension}`;
            const storageRef = ref(storage, `receipts/${fileName}`);

            // Use uploadBytesResumable for progress tracking
            const uploadTask = uploadBytesResumable(storageRef, receiptFile);

            // Wait for upload to complete
            const receiptUrl = await new Promise<string>((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Track upload progress
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        setUploadProgress(progress);
                    },
                    (error) => {
                        // Handle upload errors
                        console.error("Upload error:", error);
                        if (error.code === 'storage/unauthorized') {
                            reject(new Error("ليس لديك صلاحية رفع الملفات"));
                        } else if (error.code === 'storage/canceled') {
                            reject(new Error("تم إلغاء الرفع"));
                        } else {
                            reject(new Error("فشل رفع الملف: " + error.message));
                        }
                    },
                    async () => {
                        // Upload completed successfully - get download URL
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        } catch (urlError) {
                            reject(new Error("فشل الحصول على رابط الملف"));
                        }
                    }
                );
            });

            // 2. SAVE TO FIRESTORE
            await addDoc(collection(db, "payments"), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || "",
                amount: amount,
                planId: selectedPlanId,
                planTitle: selectedPlan?.title || "Unknown Plan",
                durationDays: selectedPlan?.durationDays || 365,
                method: selectedMethod,
                receiptUrl: receiptUrl,
                receiptFileName: fileName,
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // 3. SUCCESS FEEDBACK
            toast.success("تم إرسال طلب الاشتراك بنجاح!", {
                description: "سيتم مراجعة طلبك وتفعيل اشتراكك خلال 24 ساعة."
            });

            // Redirect to subscription page
            router.push("/subscription");

        } catch (error) {
            console.error("Submit error:", error);
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
            toast.error("فشل إرسال الطلب", { description: errorMessage });
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center font-tajawal direction-rtl text-slate-900">
            <div className="max-w-3xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">تجديد الاشتراك</h1>

                {/* 1. PLANS SELECTION */}
                {loadingPlans ? (
                    <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                ) : plans.length === 0 ? (
                    <div className="py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-slate-500">لا توجد باقات متاحة حالياً</p>
                    </div>
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
                                    disabled={isSubmitting}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all disabled:opacity-50 ${selectedMethod === method
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

                    {/* UPLOAD SECTION */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">إرفاق وصل الدفع</label>
                        <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group ${receiptFile
                                ? "border-green-400 bg-green-50/50"
                                : "border-slate-300 hover:bg-slate-50 hover:border-blue-300"
                            }`}>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />

                            {previewUrl ? (
                                <div className="space-y-3">
                                    <img
                                        src={previewUrl}
                                        alt="معاينة الوصل"
                                        className="w-32 h-32 object-cover rounded-lg mx-auto border border-slate-200"
                                    />
                                    <p className="text-sm text-green-600 font-bold">{receiptFile?.name}</p>
                                    <p className="text-xs text-slate-400">اضغط لتغيير الملف</p>
                                </div>
                            ) : receiptFile ? (
                                <div className="space-y-3">
                                    <ImageIcon className="w-12 h-12 text-green-500 mx-auto" />
                                    <p className="text-sm text-green-600 font-bold">{receiptFile.name}</p>
                                    <p className="text-xs text-slate-400">اضغط لتغيير الملف</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-sm text-slate-500">اضغط هنا لرفع صورة الوصل</p>
                                    <p className="text-xs text-slate-400 mt-1">الحد الأقصى: 1 ميغابايت (JPEG, PNG, PDF)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* UPLOAD PROGRESS BAR */}
                    {isSubmitting && uploadProgress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>جاري رفع الملف...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !receiptFile || !selectedPlanId}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {uploadProgress < 100 ? "جاري رفع الملف..." : "جاري الإرسال..."}
                            </>
                        ) : (
                            "تأكيد وإرسال الطلب"
                        )}
                    </button>

                    <Link href="/subscription" className="block text-center text-sm text-slate-400 hover:text-slate-600">
                        إلغاء والعودة
                    </Link>
                </div>
            </div>
        </div>
    );
}


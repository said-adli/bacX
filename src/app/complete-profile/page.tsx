"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrainyStoneLogoSVG } from "@/components/ui/BrainyStoneLogoSVG";
import { User, MapPin, BookOpen, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// --- DATA CONSTANTS ---
// (Ideally imported from a shared constant file, but duplicating for safety/speed now)
const WILAYAS = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
    "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
    "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
    "16 - Algiers", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
    "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine",
    "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
    "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès",
    "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
    "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma",
    "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar",
    "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt",
    "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

const MAJORS = [
    { id: "science", label: "العلوم التجريبية" },
    { id: "math", label: "الرياضيات" },
    { id: "tech", label: "التقني رياضي" },
    { id: "management", label: "التسيير والاقتصاد" },
    { id: "lit_philo", label: "الآداب والفلسفة" },
    { id: "languages", label: "اللغات الأجنبية" },
];

export default function CompleteProfilePage() {
    const { user, completeOnboarding, loading, error } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        fullName: "",
        wilaya: "",
        major: ""
    });

    // Initialize with user data if available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.displayName || ""
            }));
        }
    }, [user]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.wilaya || !formData.major || !formData.fullName) {
            toast.error("يرجى إكمال جميع الحقول المطلوبة");
            return;
        }

        try {
            await completeOnboarding({
                fullName: formData.fullName,
                wilaya: formData.wilaya,
                major: formData.major
            });
            toast.success("تم إعداد حسابك بنجاح!");
            // Navigation handled by AuthContext
        } catch (err) {
            console.error(err);
            toast.error("حدث خطأ أثناء حفظ البيانات");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20">
                        <BrainyStoneLogoSVG />
                    </div>
                </div>

                <GlassCard className="p-8 border-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200 font-amiri mb-2">
                            إكمال الملف الشخصي
                        </h1>
                        <p className="text-text-muted">مرحباً {user?.displayName || "بك"}! نحتاج لبعض التفاصيل البسيطة.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* FULL NAME (Editable) */}
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="الاسم الكامل"
                                value={formData.fullName}
                                onChange={(e) => handleChange("fullName", e.target.value)}
                                icon={User}
                                required
                                className="bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>

                        {/* WILAYA & MAJOR */}
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <select
                                    value={formData.wilaya}
                                    onChange={(e) => handleChange("wilaya", e.target.value)}
                                    className="w-full bg-surface-highlight border border-border rounded-xl px-4 py-3 pr-12 text-text-main appearance-none focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(41,151,255,0.15)] transition-all"
                                    required
                                >
                                    <option value="" disabled className="bg-background">اختر الولاية</option>
                                    {WILAYAS.map(w => (
                                        <option key={w} value={w} className="bg-background text-foreground">{w}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-text-muted" />
                            </div>

                            <div className="relative">
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <select
                                    value={formData.major}
                                    onChange={(e) => handleChange("major", e.target.value)}
                                    className="w-full bg-surface-highlight border border-border rounded-xl px-4 py-3 pr-12 text-text-main appearance-none focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(41,151,255,0.15)] transition-all"
                                    required
                                >
                                    <option value="" disabled className="bg-background">اختر الشعبة</option>
                                    {MAJORS.map(m => (
                                        <option key={m.id} value={m.id} className="bg-background text-foreground">{m.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-text-muted" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-600/20 text-lg"
                                isLoading={loading}
                            >
                                {loading ? "جاري الحفظ..." : "بدء الرحلة"}
                            </Button>
                        </div>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}

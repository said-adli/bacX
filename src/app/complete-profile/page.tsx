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
import { getWilayas, getMajors, Wilaya, Major } from "@/actions/static-data";

export default function CompleteProfilePage() {
    const { user, completeOnboarding, loading, error } = useAuth();

    // Dynamic Data State
    const [wilayas, setWilayas] = useState<Wilaya[]>([]);
    const [majors, setMajors] = useState<Major[]>([]);

    const [formData, setFormData] = useState({
        fullName: "",
        wilaya: "",
        major: ""
    });

    // Fetch Static Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [w, m] = await Promise.all([getWilayas(), getMajors()]);
                setWilayas(w);
                setMajors(m);
            } catch (e) {
                console.error("Failed to load options", e);
            }
        };
        loadData();
    }, []);

    // Auto-fill Name safety check
    useEffect(() => {
        if (user?.user_metadata?.full_name && !formData.fullName) {
            setFormData(prev => ({ ...prev, fullName: user.user_metadata.full_name }));
        }
    }, [user, formData.fullName]);

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
                        <p className="text-text-muted">مرحباً {user?.user_metadata?.full_name || "بك"}! نحتاج لبعض التفاصيل البسيطة.</p>
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
                                    {wilayas.map(w => (
                                        <option key={w.id} value={w.name} className="bg-background text-foreground">{w.name}</option>
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
                                    {majors.map(m => (
                                        <option key={m.id} value={m.name} className="bg-background text-foreground">{m.name}</option>
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


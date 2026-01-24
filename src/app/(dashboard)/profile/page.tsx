"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    User, MapPin, Loader2, BookOpen, GraduationCap, Shield, FileText,
    Edit3, X, Save, Clock, CheckCircle, AlertTriangle, Phone
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SmartButton } from "@/components/ui/SmartButton";
import { toast } from "sonner";
import { submitProfileChangeRequest, getPendingChangeRequest } from "@/actions/profile";

// Algerian Wilayas List
const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Baji Mokhtar",
    "Béni Abbès", "Timimoun", "Touggourt", "Djanet", "In Salah", "In Guezzam"
];

const MAJOR_LABELS: Record<string, string> = {
    science: "علوم تجريبية",
    math: "رياضيات",
    tech: "تقني رياضي",
    gest: "تسيير واقتصاد",
    letter: "آداب وفلسفة",
    lang: "لغات أجنبية"
};

export default function ProfilePage() {
    const { user, profile: contextProfile, refreshProfile } = useAuth();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [fetchedProfile, setFetchedProfile] = useState<any>(null);
    const [pendingRequest, setPendingRequest] = useState<any>(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        wilaya: "",
        major: "",
        study_system: "",
        bio: "",
        phone: ""
    });

    // Fetch profile and pending request
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!user) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                // Fetch profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;

                if (profileData && isMounted) {
                    setFetchedProfile(profileData);
                    setFormData({
                        full_name: profileData.full_name || "",
                        wilaya: profileData.wilaya || "",
                        major: profileData.major || "",
                        study_system: profileData.study_system || "",
                        bio: profileData.bio || "",
                        phone: profileData.phone_number || ""
                    });
                }

                // Fetch pending request
                const { data: pendingData } = await getPendingChangeRequest();
                if (isMounted && pendingData) {
                    setPendingRequest(pendingData);
                }

            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [user, supabase]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append("full_name", formData.full_name);
            formDataObj.append("wilaya", formData.wilaya);
            formDataObj.append("major", formData.major);
            formDataObj.append("study_system", formData.study_system);
            formDataObj.append("bio", formData.bio);
            formDataObj.append("phone", formData.phone);

            const result = await submitProfileChangeRequest(formDataObj);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
                setIsEditing(false);
                // Refresh pending request state
                const { data } = await getPendingChangeRequest();
                setPendingRequest(data);
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original profile data
        if (fetchedProfile) {
            setFormData({
                full_name: fetchedProfile.full_name || "",
                wilaya: fetchedProfile.wilaya || "",
                major: fetchedProfile.major || "",
                study_system: fetchedProfile.study_system || "",
                bio: fetchedProfile.bio || "",
                phone: fetchedProfile.phone_number || ""
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const displayProfile = fetchedProfile || contextProfile || {};
    const studySystemLabel = displayProfile.study_system === 'regular' ? 'طالب نظامي' :
        displayProfile.study_system === 'private' ? 'طالب حر' : "غير محدد";

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 pt-8">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">الملف الشخصي</h1>

            {/* Pending Request Banner */}
            {pendingRequest && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-yellow-400 font-bold">لديك طلب تعديل قيد المراجعة</p>
                        <p className="text-yellow-400/70 text-sm">
                            تم إرسال طلبك في {new Date(pendingRequest.created_at).toLocaleDateString('ar-DZ')}. سيتم إعلامك عند الموافقة.
                        </p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
            )}

            <GlassCard className="p-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-8 border-b border-white/10">
                    <div className="w-24 h-24">
                        <UserAvatar
                            src={displayProfile.avatar_url}
                            fallback={displayProfile.full_name}
                            size="xl"
                            className="w-24 h-24 text-3xl"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">{displayProfile.full_name || "مستخدم جديد"}</h2>
                        <div className="flex flex-wrap gap-2 text-sm text-white/60">
                            {displayProfile.study_system && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {studySystemLabel}
                                </span>
                            )}
                            {displayProfile.major && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {MAJOR_LABELS[displayProfile.major] || displayProfile.major}
                                </span>
                            )}
                            <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-yellow-400" />
                                {displayProfile.role === 'admin' ? "مسؤول (Admin)" : "طالب (Student)"}
                            </span>
                        </div>
                    </div>

                    {!isEditing && !pendingRequest && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            تعديل الملف
                        </button>
                    )}

                    {isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                إلغاء
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            الاسم الكامل
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => handleInputChange("full_name", e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="الاسم واللقب"
                            />
                        ) : (
                            <p className="text-lg font-medium text-white">{displayProfile.full_name || "غير محدد"}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            رقم الهاتف
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                dir="ltr"
                                placeholder="05 50 ..."
                            />
                        ) : (
                            <p className="text-lg font-medium text-white" dir="ltr">{displayProfile.phone_number || "غير محدد"}</p>
                        )}
                    </div>

                    {/* Wilaya */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            الولاية
                        </label>
                        {isEditing ? (
                            <select
                                value={formData.wilaya}
                                onChange={(e) => handleInputChange("wilaya", e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                            >
                                <option value="">اختر الولاية</option>
                                {WILAYAS.map((w) => (
                                    <option key={w} value={w} className="bg-zinc-900">{w}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-lg font-medium text-white">{displayProfile.wilaya || "غير محدد"}</p>
                        )}
                    </div>

                    {/* Major */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            الشعبة
                        </label>
                        {isEditing ? (
                            <select
                                value={formData.major}
                                onChange={(e) => handleInputChange("major", e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                            >
                                <option value="">اختر الشعبة</option>
                                <option value="science" className="bg-zinc-900">علوم تجريبية</option>
                                <option value="math" className="bg-zinc-900">رياضيات</option>
                                <option value="tech" className="bg-zinc-900">تقني رياضي</option>
                                <option value="gest" className="bg-zinc-900">تسيير واقتصاد</option>
                                <option value="letter" className="bg-zinc-900">آداب وفلسفة</option>
                                <option value="lang" className="bg-zinc-900">لغات أجنبية</option>
                            </select>
                        ) : (
                            <p className="text-lg font-medium text-white">
                                {MAJOR_LABELS[displayProfile.major] || displayProfile.major || "غير محدد"}
                            </p>
                        )}
                    </div>

                    {/* Study System */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            نظام الدراسة
                        </label>
                        {isEditing ? (
                            <select
                                value={formData.study_system}
                                onChange={(e) => handleInputChange("study_system", e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                            >
                                <option value="">اختر النظام</option>
                                <option value="regular" className="bg-zinc-900">طالب نظامي (متمدرس)</option>
                                <option value="private" className="bg-zinc-900">طالب حر (Libre)</option>
                            </select>
                        ) : (
                            <p className="text-lg font-medium text-white">{studySystemLabel}</p>
                        )}
                    </div>

                    {/* Bio - Full Width */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <label className="text-sm text-white/40 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            نبذة
                        </label>
                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                                placeholder="اكتب شيئاً عن نفسك..."
                            />
                        ) : (
                            <p className="text-base text-white/80 leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl">
                                {displayProfile.bio || "لا توجد نبذة تعريفية."}
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit Button (Edit Mode) */}
                {isEditing && (
                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <SmartButton
                            isLoading={isSubmitting}
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20"
                        >
                            <Save className="w-5 h-5 ml-2" />
                            إرسال للمراجعة
                        </SmartButton>
                    </div>
                )}
            </GlassCard>

            {/* Info Card */}
            <GlassCard className="p-6 border-white/10 bg-blue-600/5">
                <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">لماذا تحتاج التعديلات لموافقة؟</h3>
                        <p className="text-sm text-white/60">
                            للحفاظ على دقة البيانات وضمان جودة المعلومات، تخضع جميع التعديلات لمراجعة سريعة من فريق الإدارة.
                            عادةً ما تتم الموافقة خلال 24 ساعة.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

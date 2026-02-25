"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    User, MapPin, BookOpen, GraduationCap, Shield, FileText,
    Edit3, X, Save, Clock, AlertTriangle
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SmartButton } from "@/components/ui/SmartButton";
import { toast } from "sonner";
import { submitProfileChangeRequest } from "@/actions/profile";
import { useRouter } from "next/navigation";

// Profile data for the editor (needs specific fields that global SafeProfile strips)
export type ProfileEditorDTO = {
    id: string;
    full_name: string | null;
    wilaya_id: string | null;
    major_id: string | null;
    study_system: string | null;
    bio: string | null;
    avatar_url: string | null;
    role: string | null;
};

// Pending request DTO
export type PendingRequestDTO = {
    id: string;
    created_at: string;
    status: string;
};

// Define the shape of data passed from Server Component
interface ProfileFormProps {
    initialProfile: ProfileEditorDTO | null;
    branches: { id: string; name: string }[];
    wilayas: { id: number | string; name_ar: string; name_en: string }[];
    pendingRequest: PendingRequestDTO | null;
}

export default function ProfileForm({ initialProfile, branches, wilayas, pendingRequest }: ProfileFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Form State
    const [formData, setFormData] = useState({
        full_name: initialProfile?.full_name || "",
        wilaya: initialProfile?.wilaya_id || "",
        major: initialProfile?.major_id || "",
        study_system: initialProfile?.study_system || "",
        bio: initialProfile?.bio || ""
    });

    // Helper for labels
    const getStudySystemLabel = (system: string) => {
        if (system === 'regular') return 'طالب نظامي';
        if (system === 'private') return 'طالب حر';
        return 'غير محدد';
    };

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

            const result = await submitProfileChangeRequest(formDataObj);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
                setIsEditing(false);
                router.refresh(); // Refresh server data to show pending state
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form
        setFormData({
            full_name: initialProfile?.full_name || "",
            wilaya: initialProfile?.wilaya_id || "",
            major: initialProfile?.major_id || "",
            study_system: initialProfile?.study_system || "",
            bio: initialProfile?.bio || ""
        });
        setIsEditing(false);
    };

    // Derived Display Values (for View Mode)
    // Note: We use the initialProfile for display when NOT editing.
    // Ideally, if a successful save happened, router.refresh causes a re-render with new initialProfile props?
    // Actually, submitProfileChangeRequest creates a REQUEST, it doesn't update profile immediately.
    // So visual data remains same, but pending banner appears.

    const displayProfile: Partial<ProfileEditorDTO> = initialProfile || {};
    // Use the fetched arrays to find names for ID values
    const selectedWilaya = wilayas.find(w => w.id == displayProfile.wilaya_id);
    const selectedBranch = branches.find(b => b.id == displayProfile.major_id);

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
                            fallback={displayProfile.full_name || undefined}
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
                                    {getStudySystemLabel(displayProfile.study_system)}
                                </span>
                            )}
                            {selectedBranch && (
                                <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {selectedBranch.name}
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

                    {/* Wilaya - Display updated */}
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
                                {wilayas.map((w) => (
                                    <option key={w.id} value={w.id} className="bg-zinc-900">
                                        {w.id} - {w.name_ar}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-lg font-medium text-white">
                                {selectedWilaya
                                    ? `${selectedWilaya.id} - ${selectedWilaya.name_ar}`
                                    : "لم يتم التحديد"}
                            </p>
                        )}
                    </div>

                    {/* Major / Branch - Display updated */}
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
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id} className="bg-zinc-900">
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-lg font-medium text-white">
                                {selectedBranch?.name || "لم يتم التحديد"}
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
                            <p className="text-lg font-medium text-white">{getStudySystemLabel(displayProfile.study_system || "")}</p>
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
        </div>
    );
}

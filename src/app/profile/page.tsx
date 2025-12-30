"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Mail, Calendar, GraduationCap, MapPin, Shield, CreditCard, Settings, Loader2, Crown } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface UserData {
    fullName: string;
    email: string;
    wilaya: string;
    major: string;
    role: string;
    isSubscribed: boolean;
    subscriptionPlan?: string;
    subscriptionExpiry?: { toDate: () => Date } | Date;
    createdAt?: { toDate: () => Date } | Date;
}

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth");
            return;
        }

        async function fetchUserData() {
            if (!user) return;
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsFetching(false);
            }
        }

        if (user) {
            fetchUserData();
        }
    }, [user, loading, router]);

    if (loading || isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    // Helper to format date safely
    const formatDate = (dateObj: { toDate: () => Date } | Date | undefined) => {
        if (!dateObj) return "غير متوفر";
        let date: Date;
        if ('toDate' in dateObj && typeof dateObj.toDate === 'function') {
            date = dateObj.toDate();
        } else {
            date = dateObj as Date;
        }
        return format(date, "d MMMM yyyy", { locale: ar });
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 md:p-12 font-tajawal direction-rtl text-slate-900 pb-24">

            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-slate-900">حسابي</h1>
                <p className="text-slate-500">لوحة التحكم الخاصة بمعلوماتك الشخصية والأكاديمية</p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Main Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Identity Card */}
                    <div className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />

                        {/* Avatar */}
                        <div className="relative z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-600/20">
                            {userData?.fullName?.[0]?.toUpperCase() || user.displayName?.[0]?.toUpperCase() || "S"}
                        </div>

                        <div className="relative z-10 flex-1 text-center md:text-right space-y-2 mt-2">
                            <h2 className="text-2xl font-bold text-slate-900">{userData?.fullName || user.displayName}</h2>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                    <User className="w-3.5 h-3.5" />
                                    {userData?.role === 'admin' ? 'مـسؤول' : 'طالب'}
                                </span>
                                {userData?.isSubscribed && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100">
                                        <Crown className="w-3.5 h-3.5" />
                                        مشترك (Premium)
                                    </span>
                                )}
                            </div>
                            <div className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-2 pt-2">
                                <Mail className="w-4 h-4" /> {userData?.email || user.email}
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                            المعلومات الأكاديمية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-bold block mb-1">الشعبة</span>
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                                    {userData?.major || "غير محدد"}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-bold block mb-1">الولاية</span>
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <MapPin className="w-5 h-5 text-rose-500" />
                                    {userData?.wilaya || "غير محدد"}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-bold block mb-1">تاريخ التسجيل</span>
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                    {formatDate(userData?.createdAt)}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-bold block mb-1">حالة الاشتراك</span>
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <Shield className={userData?.isSubscribed ? "w-5 h-5 text-green-500" : "w-5 h-5 text-slate-400"} />
                                    {userData?.isSubscribed ? "نشط" : "مجاني"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white/80 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">إجراءات سريعة</h3>
                        <div className="space-y-3">
                            <Link href="/profile/settings" className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100 rounded-xl transition-all group">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">الإعدادات العامة</div>
                                    <div className="text-xs text-slate-500">تغيير كلمة المرور والاسم</div>
                                </div>
                            </Link>

                            <Link href="/profile/payments" className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100 rounded-xl transition-all group">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-slate-800">سجل المدفوعات</div>
                                    <div className="text-xs text-slate-500">عرض تاريخ الاشتراكات</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Subscription Promo (If not subscribed) */}
                    {!userData?.isSubscribed && (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            <Crown className="w-8 h-8 mb-4 text-yellow-300" />
                            <h3 className="text-xl font-bold mb-2">رقِّ حسابك الآن</h3>
                            <p className="text-blue-100 text-sm mb-6">احصل على وصول كامل لجميع الدروس والتمارين المكثفة، وضاعف فرصك في النجاح.</p>
                            <Link href="/subscription" className="block w-full text-center py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                                عرض الباقات
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

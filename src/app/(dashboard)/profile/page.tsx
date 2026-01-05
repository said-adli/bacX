"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";
import { Mail, GraduationCap, Shield, CreditCard, Settings, Loader2, ChevronLeft } from "lucide-react";

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
    createdAt?: Date;
}

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    // Use profile from context if available, or fetch fresh? 
    // Context profile might be enough if it has all fields.
    // The previous code fetched "users/{uid}" separately.
    // In Supabase, "profiles" is the table.
    // Let's rely on AuthContext profile first, but maybe we need subscription info from a different table or joined?
    // "profiles" should have: full_name, wilaya, major, role, is_profile_complete.
    // Subscription info might be in "profiles" (is_subscribed?) or separate "subscriptions" table.
    // Looking at `AuthContext`, it selects `*, wilayas(full_label), majors(label)`.
    // Let's assume `profiles` has `is_subscribed` etc based on previous `admin/users/page.tsx` migration work.

    // Actually, `admin/users/page.tsx` used `user.is_subscribed` etc.
    // Let's assume the profile in Supabase has these fields mapped or available.
    // If not, we might need adjustments.

    // For now, let's use the local profile from AuthContext if possible, but the original code fetched specific fields.
    // The original code uses `UserData` interface.
    // Let's stick to component-level fetching for ensuring we get the exact fields, 
    // but using Supabase Client.

    const [userData, setUserData] = useState<UserData | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth");
            return;
        }

        async function fetchUserData() {
            if (!user) return;
            try {
                // Fetch from 'profiles'
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setUserData({
                        fullName: data.full_name,
                        email: user.email || "",
                        wilaya: data.wilaya, // or join
                        major: data.major,   // or join
                        role: data.role,
                        isSubscribed: data.is_subscribed,
                        subscriptionPlan: data.subscription_plan,
                        subscriptionExpiry: data.subscription_expiry ? new Date(data.subscription_expiry) : undefined,
                        createdAt: data.created_at ? new Date(data.created_at) : undefined
                    });
                }
            } catch {
                // console.error("Error fetching profile");
            } finally {
                setIsFetching(false);
            }
        }

        if (user) {
            fetchUserData();
        }
    }, [user, loading, router, supabase]);

    if (loading || isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    const formatDate = (dateObj: Date | undefined) => {
        if (!dateObj) return "—";
        return format(dateObj, "d MMMM yyyy", { locale: ar });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">الرئيسية</Link>
                <ChevronLeft className="w-3 h-3" />
                <span className="text-foreground">الملف الشخصي</span>
            </div>

            {/* Header */}
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-1">الملف الشخصي</h1>
                <p className="text-sm text-muted-foreground">معلوماتك الشخصية والأكاديمية</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Identity Panel */}
                    <section className="panel">
                        <div className="panel-header">
                            <span className="panel-title">المعلومات الأساسية</span>
                        </div>
                        <div className="panel-body">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white text-xl font-bold">
                                    {userData?.fullName?.[0]?.toUpperCase() || user.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">
                                        {userData?.fullName || user.user_metadata?.full_name || "المستخدم"}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        {userData?.email || user.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`badge ${userData?.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                                    {userData?.role === 'admin' ? 'مسؤول' : 'طالب'}
                                </span>
                                <span className={`badge ${userData?.isSubscribed ? 'badge-success' : 'badge-neutral'}`}>
                                    {userData?.isSubscribed ? 'مشترك' : 'مجاني'}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Academic Info */}
                    <section className="panel">
                        <div className="panel-header flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span className="panel-title">المعلومات الأكاديمية</span>
                        </div>
                        <div className="panel-body">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-background-subtle rounded-xl border border-glass-border">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">الشعبة</div>
                                    <div className="font-semibold text-foreground">{userData?.major || "غير محدد"}</div>
                                </div>
                                <div className="p-4 bg-background-subtle rounded-xl border border-glass-border">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">الولاية</div>
                                    <div className="font-semibold text-foreground">{userData?.wilaya || "غير محدد"}</div>
                                </div>
                                <div className="p-4 bg-background-subtle rounded-xl border border-glass-border">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">تاريخ التسجيل</div>
                                    <div className="font-semibold text-foreground">{formatDate(userData?.createdAt)}</div>
                                </div>
                                <div className="p-4 bg-background-subtle rounded-xl border border-glass-border">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">حالة الاشتراك</div>
                                    <div className="font-semibold text-foreground">{userData?.isSubscribed ? "نشط" : "مجاني"}</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Side Column — Actions */}
                <div className="space-y-6">
                    <section className="panel">
                        <div className="panel-header">
                            <span className="panel-title">إجراءات</span>
                        </div>
                        <div className="divide-y divide-glass-border">
                            <Link
                                href="/profile/settings"
                                className="flex items-center gap-3 p-4 hover:bg-glass-surface-hover transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-background-subtle flex items-center justify-center">
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">الإعدادات</div>
                                    <div className="text-xs text-muted-foreground">تعديل البيانات</div>
                                </div>
                            </Link>

                            <Link
                                href="/subscription"
                                className="flex items-center gap-3 p-4 hover:bg-glass-surface-hover transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-background-subtle flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">الاشتراك</div>
                                    <div className="text-xs text-muted-foreground">إدارة الباقة</div>
                                </div>
                            </Link>

                            <Link
                                href="/profile/payments"
                                className="flex items-center gap-3 p-4 hover:bg-glass-surface-hover transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-background-subtle flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">سجل المدفوعات</div>
                                    <div className="text-xs text-muted-foreground">عرض التاريخ</div>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Upgrade CTA */}
                    {!userData?.isSubscribed && (
                        <section className="panel bg-primary/10 border-primary/30">
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-2 text-foreground">ترقية الحساب</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    وصول كامل لجميع المحتوى الأكاديمي
                                </p>
                                <Link href="/subscription" className="btn btn-primary w-full">
                                    عرض الباقات
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

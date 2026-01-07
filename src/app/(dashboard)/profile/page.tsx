"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mail, GraduationCap, Shield, CreditCard, Settings, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// ============================================================================
// PROFILE PAGE - NON-BLOCKING
// ============================================================================
// Auth is handled by middleware. Page renders immediately with skeleton.
// Data fetches in useEffect. NO blocking if(loading) return.
// ============================================================================

interface UserData {
    fullName: string;
    email: string;
    wilaya: string;
    major: string;
    role: string;
    isSubscribed: boolean;
    subscriptionPlan?: string;
    subscriptionExpiry?: Date;
    createdAt?: Date;
}

export default function ProfilePage() {
    const { user, profile } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchUserData() {
            // Checkpoint: fetch started
            if (typeof window !== "undefined") {
                window.__DIAG_CHECKPOINT?.("PROFILE_FETCH_START");
            }
            const start = performance.now();

            if (!user) {
                setIsFetching(false);
                return;
            }
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setUserData({
                        fullName: data.full_name,
                        email: user.email || "",
                        wilaya: data.wilaya,
                        major: data.major,
                        role: data.role,
                        isSubscribed: data.is_subscribed,
                        subscriptionPlan: data.subscription_plan,
                        subscriptionExpiry: data.subscription_expiry ? new Date(data.subscription_expiry) : undefined,
                        createdAt: data.created_at ? new Date(data.created_at) : undefined
                    });
                }
            } catch {
                // Silent fail - show skeleton/empty state
            } finally {
                const end = performance.now();
                const fetchTime = end - start;
                console.log(`[PROFILE] FETCH_TIME: ${fetchTime.toFixed(0)}ms`);

                // Checkpoint: fetch done
                if (typeof window !== "undefined") {
                    window.__DIAG_FETCH_TIME?.(fetchTime);
                }
                setIsFetching(false);
            }
        }
        fetchUserData();
    }, [user, supabase]);

    const formatDate = (dateObj: Date | undefined) => {
        if (!dateObj) return "—";
        return format(dateObj, "d MMMM yyyy", { locale: ar });
    };

    // Get display values (from fetched data or context fallback)
    const displayName = userData?.fullName || profile?.full_name || user?.user_metadata?.full_name || "المستخدم";
    const displayEmail = userData?.email || user?.email || "";
    const displayRole = userData?.role || profile?.role || "student";
    const isSubscribed = userData?.isSubscribed || profile?.is_subscribed || false;

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
                                    {isFetching ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        displayName[0]?.toUpperCase() || "U"
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">
                                        {isFetching ? <span className="bg-white/10 rounded animate-pulse inline-block w-32 h-5" /> : displayName}
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        {displayEmail}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`badge ${displayRole === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                                    {displayRole === 'admin' ? 'مسؤول' : 'طالب'}
                                </span>
                                <span className={`badge ${isSubscribed ? 'badge-success' : 'badge-neutral'}`}>
                                    {isSubscribed ? 'مشترك' : 'مجاني'}
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
                                    <div className="font-semibold text-foreground">{isSubscribed ? "نشط" : "مجاني"}</div>
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
                    {!isSubscribed && (
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

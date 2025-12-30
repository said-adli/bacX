"use client";

import { useAuth } from "@/context/AuthContext";
import { Monitor, Smartphone, CheckCircle, Clock, XCircle, LogOut as LogOutIcon, CreditCard, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { arMA } from "date-fns/locale";
import Link from "next/link";
// Removed unused useRouter since it was unused in logic

interface Device {
    id: string;
    name: string;
    lastActive: Date;
    current: boolean;
}

export default function SubscriptionPage() {
    const { user, role } = useAuth(); // Removed unused logout
    const [devices, setDevices] = useState<Device[]>([]);

    // Mock data for payments until real collection exists
    const [payments] = useState([
        { id: 1, date: new Date(), amount: "4500 DZD", status: "approved", method: "CCP" },
        // { id: 2, date: new Date(Date.now() - 86400000 * 30), amount: "2000 DZD", status: "expired", method: "BaridiMob" },
    ]);

    useEffect(() => {
        if (user && typeof window !== "undefined") {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setDevices([
                { id: "device_current", name: window.navigator.userAgent.slice(0, 20) + "...", lastActive: new Date(), current: true },
                { id: "device_old", name: "iPhone 13 - Safari", lastActive: new Date(Date.now() - 86400000 * 2), current: false }
            ]);
        }
    }, [user]);

    const handleLogoutDevice = (deviceId: string) => {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
    };

    const isSubscribed = role === 'admin' || (user as { isSubscribed?: boolean })?.isSubscribed;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-8 max-w-5xl mx-auto font-sans">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">اشتراكي</span>
            </div>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">إدارة الاشتراك</h1>
                <Link href="/subscription/purchase" className="text-sm text-primary hover:underline underline-offset-4">
                    هل تريد تجديد الاشتراك؟
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-full h-1 ${isSubscribed ? "bg-gradient-to-r from-green-500 to-primary" : "bg-gradient-to-r from-red-500 to-orange-500"}`} />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold mb-2">حالة الاشتراك</h2>
                                <p className="text-muted-foreground text-sm">تفاصيل باقتك الحالية وصلاحيتها</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${isSubscribed ?
                                "bg-green-500/10 text-green-500 border border-green-500/20" :
                                "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                                {isSubscribed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {role === 'admin' ? "مسؤول (غير محدود)" : isSubscribed ? "نشط" : "منتهي/غير مشترك"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="text-sm text-muted-foreground mb-1">الباقة</div>
                                <div className="font-bold text-lg">{isSubscribed ? "السنة كاملة (Yearly)" : "مجاني"}</div>
                            </div>
                            <div className="bg-muted/50 rounded-xl p-4">
                                <div className="text-sm text-muted-foreground mb-1">الأيام المتبقية</div>
                                <div className={`font-bold text-lg ${isSubscribed ? "text-primary" : "text-muted-foreground"}`}>
                                    {isSubscribed ? "365 يوم" : "0 يوم"}
                                </div>
                            </div>
                        </div>

                        {isSubscribed && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                                <Clock className="w-4 h-4 text-blue-500" />
                                ينتهي الاشتراك في {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('ar-MA')}
                            </div>
                        )}
                    </div>

                    {/* Payment History */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            سجل الدفعات
                        </h2>
                        {payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="text-muted-foreground border-b border-border/50">
                                        <tr>
                                            <th className="pb-3 font-medium">التاريخ</th>
                                            <th className="pb-3 font-medium">المبلغ</th>
                                            <th className="pb-3 font-medium">الطريقة</th>
                                            <th className="pb-3 font-medium">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {payments.map(payment => (
                                            <tr key={payment.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="py-4 text-foreground">{formatDistanceToNow(payment.date, { addSuffix: true, locale: arMA })}</td>
                                                <td className="py-4 font-bold">{payment.amount}</td>
                                                <td className="py-4 text-muted-foreground">{payment.method}</td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                        payment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {payment.status === 'approved' ? 'مقبول' : payment.status === 'pending' ? 'قيد المراجعة' : 'منتهي'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">لا يوجد سجل دفعات</div>
                        )}
                    </div>
                </div>

                {/* Device Manager */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-primary" />
                        الأجهزة المتصلة
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">إدارة الأجهزة التي يمكنها الدخول لحسابك (الحد الأقصى: 2)</p>

                    <div className="space-y-4">
                        {devices.map(device => (
                            <div key={device.id} className="flex items-start justify-between p-3 rounded-xl bg-muted/30 border border-border/50 group hover:border-primary/20 transition-colors">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                                        {device.name.toLowerCase().includes('phone') ?
                                            <Smartphone className="w-5 h-5 text-muted-foreground" /> :
                                            <Monitor className="w-5 h-5 text-muted-foreground" />
                                        }
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm line-clamp-1" title={device.name}>{device.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            {device.current ? <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> : null}
                                            {device.current ? "الجهاز الحالي" : formatDistanceToNow(device.lastActive, { addSuffix: true, locale: arMA })}
                                        </div>
                                    </div>
                                </div>
                                {!device.current && (
                                    <button
                                        onClick={() => handleLogoutDevice(device.id)}
                                        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                                        title="تسجيل خروج الجهاز"
                                    >
                                        <LogOutIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

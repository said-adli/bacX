"use client";

import { useAuth } from "@/context/AuthContext";
import { Monitor, Smartphone, CheckCircle, Clock, XCircle, LogOut as LogOutIcon, CreditCard, ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { arMA } from "date-fns/locale";
import Link from "next/link";

interface Device {
    id: string;
    name: string;
    lastActive: Date;
    current: boolean;
}

export default function SubscriptionPage() {
    const { user, role } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [payments] = useState([
        { id: 1, date: new Date(), amount: "4,500 دج", status: "approved", method: "CCP" },
    ]);

    const hasInitialized = useRef(false);

    useEffect(() => {
        const agent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown';
        if (user && !hasInitialized.current) {
            setTimeout(() => {
                setDevices([
                    { id: "device_current", name: agent.slice(0, 20), lastActive: new Date(), current: true },
                    { id: "device_old", name: "Other Device", lastActive: new Date(), current: false }
                ]);
                hasInitialized.current = true;
            }, 0);
        }
    }, [user]);

    const handleLogoutDevice = (deviceId: string) => {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
    };

    const isSubscribed = role === 'admin' || (user as { isSubscribed?: boolean })?.isSubscribed;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">الرئيسية</Link>
                <ChevronLeft className="w-3 h-3" />
                <span className="text-foreground">الاشتراك</span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">إدارة الحساب</h1>
                    <p className="text-sm text-muted-foreground">معلومات الاشتراك والأجهزة المتصلة</p>
                </div>
                <Link href="/subscription/purchase" className="btn btn-primary text-sm">
                    تجديد الاشتراك
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Account Status */}
                    <section className="panel">
                        <div className="panel-header flex items-center justify-between">
                            <span className="panel-title">حالة الحساب</span>
                            <span className={`badge ${isSubscribed ? 'badge-success' : 'badge-danger'}`}>
                                {role === 'admin' ? 'مسؤول' : isSubscribed ? 'نشط' : 'غير مشترك'}
                            </span>
                        </div>
                        <div className="panel-body">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">الباقة</div>
                                    <div className="font-semibold text-foreground">
                                        {isSubscribed ? "الاشتراك السنوي" : "الباقة المجانية"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">الأيام المتبقية</div>
                                    <div className="font-semibold text-foreground">
                                        {isSubscribed ? "365 يوم" : "—"}
                                    </div>
                                </div>
                            </div>

                            {isSubscribed && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-background-subtle rounded-xl border border-glass-border">
                                    <Clock className="w-4 h-4" />
                                    ينتهي الاشتراك في {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-MA')}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Payment History */}
                    <section className="panel">
                        <div className="panel-header flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="panel-title">سجل المدفوعات</span>
                        </div>

                        {payments.length > 0 ? (
                            <table className="table-enterprise">
                                <thead>
                                    <tr>
                                        <th>التاريخ</th>
                                        <th>المبلغ</th>
                                        <th>الطريقة</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment.id}>
                                            <td>{formatDistanceToNow(payment.date, { addSuffix: true, locale: arMA })}</td>
                                            <td className="font-semibold">{payment.amount}</td>
                                            <td>{payment.method}</td>
                                            <td>
                                                <span className={`badge ${payment.status === 'approved' ? 'badge-success' :
                                                    payment.status === 'pending' ? 'badge-warning' : 'badge-neutral'
                                                    }`}>
                                                    {payment.status === 'approved' ? 'مقبول' :
                                                        payment.status === 'pending' ? 'قيد المراجعة' : 'منتهي'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="panel-body text-center text-sm text-muted-foreground">
                                لا يوجد سجل دفعات
                            </div>
                        )}
                    </section>
                </div>

                {/* Side Column — Devices */}
                <section className="panel h-fit">
                    <div className="panel-header">
                        <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-muted-foreground" />
                            <span className="panel-title">الأجهزة المتصلة</span>
                        </div>
                    </div>
                    <div className="panel-body text-xs text-muted-foreground mb-4">
                        الحد الأقصى: 2 أجهزة
                    </div>

                    <div className="divide-y divide-glass-border">
                        {devices.map(device => (
                            <div key={device.id} className="p-4 flex items-start justify-between">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-background-subtle flex items-center justify-center">
                                        {device.name.toLowerCase().includes('phone') ?
                                            <Smartphone className="w-4 h-4 text-muted-foreground" /> :
                                            <Monitor className="w-4 h-4 text-muted-foreground" />
                                        }
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                            {device.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            {device.current && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
                                            {device.current ? "الجهاز الحالي" : formatDistanceToNow(device.lastActive, { addSuffix: true, locale: arMA })}
                                        </div>
                                    </div>
                                </div>
                                {!device.current && (
                                    <button
                                        onClick={() => handleLogoutDevice(device.id)}
                                        className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                    >
                                        <LogOutIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

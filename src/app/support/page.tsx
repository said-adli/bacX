"use client";

import { Mail, MessageCircle, Phone, HelpCircle } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/dashboard" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">الدعم الفني</span>
            </div>

            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold">مركز المساعدة</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    نحن هنا لمساعدتك. اختر الطريقة التي تناسبك للتواصل معنا وسنقوم بالرد عليك في أقرب وقت.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors group cursor-pointer shadow-sm">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold mb-2">المحادثة المباشرة</h3>
                    <p className="text-sm text-muted-foreground mb-4">تحدث مع فريق الدعم مباشرة</p>
                    <span className="text-blue-500 text-sm font-bold">ابدأ المحادثة</span>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors group cursor-pointer shadow-sm">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 group-hover:scale-110 transition-transform">
                        <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold mb-2">اتصل بنا</h3>
                    <p className="text-sm text-muted-foreground mb-4">0550 00 00 00</p>
                    <span className="text-green-500 text-sm font-bold">اتصل الآن</span>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors group cursor-pointer shadow-sm">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold mb-2">البريد الإلكتروني</h3>
                    <p className="text-sm text-muted-foreground mb-4">support@bacx.dz</p>
                    <span className="text-purple-500 text-sm font-bold">ارسل رسالة</span>
                </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-8 text-center border border-border/50">
                <h3 className="font-bold mb-2">الأسئلة الشائعة</h3>
                <p className="text-muted-foreground text-sm mb-6">ابحث عن إجابات لأسئلتك قبل التواصل معنا</p>
                <Link href="#" className="px-6 py-2 bg-background border border-border rounded-lg text-sm font-bold hover:bg-muted transition-colors">
                    تصفح الأسئلة الشائعة
                </Link>
            </div>
        </div>
    );
}

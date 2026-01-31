"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export function AuthStatusBtn() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        checkUser();
    }, []);

    if (loading) {
        return <div className="w-24 h-10 bg-white/5 rounded-full animate-pulse" />;
    }

    if (user) {
        return (
            <Link
                href="/dashboard"
                className="relative px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] hover:-translate-y-0.5"
            >
                <div className="flex items-center gap-2">
                    <span>اللوحة</span>
                    <ArrowLeft className="w-3 h-3" />
                </div>
            </Link>
        );
    }

    return (
        <Link
            href="/login"
            className="relative px-6 py-2 rounded-full border border-white/10 text-white/80 hover:text-white hover:border-white/30 transition-all text-xs uppercase tracking-widest font-medium group overflow-hidden bg-white/5 hover:bg-white/10"
        >
            <span className="relative z-10 font-cinzel text-xs font-bold">تسجيل الدخول</span>
        </Link>
    );
}

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export async function AuthButton() {
    // 0ms delay typically, but async allows streaming
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

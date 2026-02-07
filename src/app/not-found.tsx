"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export const dynamic = 'force-dynamic';

export default function NotFound() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 flex items-center justify-center p-4 overflow-hidden relative direction-rtl font-tajawal">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/20 blur-[150px] rounded-full" />
            </div>

            <GlassCard className="max-w-md w-full p-12 text-center border-blue-100 bg-white/80 backdrop-blur-md shadow-2xl shadow-blue-900/5 relative z-10 flex flex-col items-center">

                {/* 3D Floating Graphic Concept */}
                <motion.div
                    animate={{
                        y: [0, -15, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-8 relative"
                >
                    <div className="w-32 h-32 rounded-full bg-blue-100/50 blur-xl absolute inset-0" />
                    <Compass className="w-32 h-32 text-blue-600 relative z-10 drop-shadow-xl" strokeWidth={1} />
                </motion.div>

                <h1 className="text-4xl font-bold text-slate-900 mb-4 font-tajawal">
                    أنت خارج المسار
                </h1>

                <p className="text-slate-600 mb-8 font-tajawal text-lg">
                    الصفحة التي تبحث عنها غير موجودة. يبدو أنك ضللت الطريق في رحلتك الدراسية.
                </p>

                <Button
                    onClick={() => router.back()}
                    className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 py-6 text-lg font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    العودة للمسار الصحيح
                </Button>

            </GlassCard>
        </main>
    );
}

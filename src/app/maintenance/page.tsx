import { GlassCard } from "@/components/ui/GlassCard";
import { Construction } from "lucide-react";

export default function MaintenancePage() {
    return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <GlassCard className="max-w-lg w-full p-10 text-center relative z-10 border-white/5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5">
                    <Construction className="w-10 h-10 text-amber-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4 font-tajawal">تحت الصيانة</h1>
                <p className="text-zinc-400 text-lg leading-relaxed font-tajawal mb-8">
                    نقوم حالياً بإجراء تحديثات هامة لتحسين تجربتك في Brainy.
                    <br />
                    سنعود للعمل قريباً جداً.
                </p>

                <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-primary/50 w-1/3 animate-[shimmer_2s_infinite_linear] bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>
                <p className="text-xs text-zinc-600 mt-4">System Update In Progress...</p>
            </GlassCard>
        </main>
    );
}

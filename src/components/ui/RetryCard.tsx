import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { RefreshCw, WifiOff } from "lucide-react";

interface RetryCardProps {
    onRetry: () => void;
    error?: string;
}

export function RetryCard({ onRetry, error }: RetryCardProps) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
            <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 font-tajawal">تعذر الاتصال بالخادم</h2>
                <p className="text-zinc-400 mb-8 font-tajawal">
                    {error || "حدث خطأ أثناء تحميل البيانات. يرجى التحقق من الاتصال والمحاولة مرة أخرى."}
                </p>
                <Button
                    onClick={onRetry}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    إعادة المحاولة
                </Button>
            </GlassCard>
        </div>
    );
}

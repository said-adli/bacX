import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
    id: string;
    name: string;
    price: number;
    features: string[];
    type?: 'subscription' | 'course';
    duration_days?: number;
    highlight?: boolean;
    isAdmin?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onSelect?: (id: string) => void;
}

export function SubscriptionCard({
    id,
    name,
    price,
    features,
    type = 'subscription',
    duration_days,
    highlight = false,
    isAdmin = false,
    onEdit,
    onDelete,
    onSelect
}: SubscriptionCardProps) {
    return (
        <div className={cn(
            "relative rounded-3xl p-8 backdrop-blur-md transition-all duration-300 group border",
            highlight
                ? "bg-gradient-to-b from-blue-900/40 to-black/60 border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.2)]"
                : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-black/50"
        )}>
            {/* Highlight Badge */}
            {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-xs font-bold text-white shadow-lg tracking-wider">
                    RECOMMENDED
                </div>
            )}

            {/* Type & Duration Badge */}
            <div className="flex justify-between items-start mb-4">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                    type === 'course'
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}>
                    {type === 'course' ? 'COURSE' : 'PLAN'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                    {duration_days ? `${duration_days} DAYS` : 'LIFETIME'}
                </span>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-white">{price.toLocaleString()}</span>
                    <span className="text-sm font-medium text-zinc-500">DZD</span>
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                        <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                            <Check size={10} className="text-blue-400" />
                        </div>
                        <span>{feature}</span>
                    </li>
                ))}
                {features.length === 0 && (
                    <li className="text-center text-zinc-600 params text-sm italic">No features listed</li>
                )}
            </ul>

            {/* Actions */}
            {isAdmin ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit?.(id)}
                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete?.(id)}
                        className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors"
                    >
                        Delete
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => onSelect?.(id)}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl",
                        highlight
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
                            : "bg-white text-black hover:bg-zinc-200"
                    )}
                >
                    Select Plan
                </button>
            )}
        </div>
    );
}


import { GlassCard } from "@/components/ui/GlassCard";
import { MessageSquare, ThumbsUp, Share2 } from "lucide-react";

export const metadata = {
  title: "مجتمع الطلبة",
};


export default function CommunityPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">مجتمع Brainy</h1>
                    <p className="text-white/60">شارك أسئلتك وناقش الدروس مع زملائك</p>
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all font-bold">
                    موضوع جديد +
                </button>
            </div>

            {/* Topics Feed */}
            <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                    <GlassCard key={i} className="p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex gap-4">
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                                {i === 0 ? "A" : i === 1 ? "S" : "M"}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                                        {i === 0 ? "كيف يمكنني حساب نهاية دالة لوغاريتمية؟" :
                                            i === 1 ? "ملخص لدرس الحرب العالمية الثانية" :
                                                "أفضل طريقة لمراجعة الإنجليزية؟"}
                                    </h3>
                                    <span className="text-xs text-white/30">منذ 2 ساعة</span>
                                </div>

                                <p className="text-white/60 text-sm line-clamp-2">
                                    السلام عليكم، أواجه صعوبة في فهم بعض قواعد النهايات الخاصة بالدالة اللوغاريتمية، هل من ملخص مبسط؟ وشكراً جزيلاً.
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-6 pt-2">
                                    <button className="flex items-center gap-2 text-white/40 hover:text-blue-400 transition-colors text-sm">
                                        <ThumbsUp size={16} />
                                        <span>12</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-white/40 hover:text-blue-400 transition-colors text-sm">
                                        <MessageSquare size={16} />
                                        <span>5 تعليقات</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mr-auto">
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}

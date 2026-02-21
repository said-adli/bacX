import { getLessonData } from "@/actions/lesson";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import MarkCompleteButton from "@/components/lesson/MarkCompleteButton";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen";
import { Lock, Video, FileText, Clock } from "lucide-react";

export default async function ActiveVideoPlayer({ lessonId, isSubscribed }: { lessonId: string | undefined, isSubscribed?: boolean }) {

    // 0. Empty State
    if (!lessonId) {
        return (
            <div className="w-full aspect-video bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="w-8 h-8 text-white/30" />
                    </div>
                    <p className="text-white/50">اختر درساً للبدء</p>
                </div>
            </div>
        );
    }

    // 1. Fetch Data
    // 1. Fetch Data
    const { getSecureVideoId } = await import("@/actions/video");
    // @ts-expect-error - isOwned is now returned
    const { lesson, isCompleted, isOwned, error } = await getLessonData(lessonId);

    // Fetch Secure Token (Parallel)
    let secureVideoData: { videoId: string, token: string } | null = null;
    let accessError = null;

    try {
        if (lesson && (isSubscribed || lesson.is_free || lesson.required_plan_id || isOwned)) {
            // Attempt to get token if we think user might have access
            secureVideoData = await getSecureVideoId(lessonId);
        }
    } catch (e) {
        // Access might be denied here, we handle it visually below
        accessError = e;
    }

    if (error || !lesson) {
        return (
            <div className="w-full aspect-video bg-red-900/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
                <p className="text-red-400">فشل تحميل الدرس</p>
            </div>
        );
    }

    // 2. Access Control
    // [Logic] If lesson requires specific plan (required_plan_id) -> Check if user has it.
    // For now, simplify: If not free, requires subscription.
    // Ideally userProfile should be passed down or re-fetched.
    // Assuming 'isSubscribed' is enough for general access, but specific plan logic needed if 'required_plan_id' exists.

    const hasAccess = isSubscribed || lesson.is_free || isOwned; // Or check specific plan if passed

    return (
        <div className="flex flex-col gap-6">
            <div className="relative w-full aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl group">
                {hasAccess ? (
                    (secureVideoData?.token) ? (
                        <EncodedVideoPlayer
                            encodedVideoId={secureVideoData.token}
                            lessonId={lesson.id}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-white/30" />
                            </div>
                            <p className="text-white/50">لا يوجد فيديو لهذا الدرس</p>
                        </div>
                    )
                ) : (
                    <PremiumLockScreen
                        planName={lesson.subscription_plans?.name}
                        planId={lesson.subscription_plans?.id}
                        price={lesson.subscription_plans?.price?.toString()}
                        isPurchasable={lesson.is_purchasable}
                        purchasePrice={lesson.price}
                        contentId={lesson.id}
                        contentType="lesson"
                    />
                )}
            </div>

            {/* Meta & Actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-white">{lesson.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} className="text-blue-400" />
                                {lesson.duration || "غير محدد"}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasAccess && (
                            <MarkCompleteButton lessonId={lesson.id} />
                        )}

                        {lesson.pdf_url && (
                            <a
                                href={lesson.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-colors border border-blue-600/20 text-sm font-bold"
                            >
                                <FileText size={18} />
                                تحميل ملخص PDF
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

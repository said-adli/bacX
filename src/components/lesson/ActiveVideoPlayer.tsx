import { getLessonData } from "@/actions/lesson";
import EncodedVideoPlayer from "@/components/lesson/VideoPlayer";
import MarkCompleteButton from "@/components/lesson/MarkCompleteButton";
import { PremiumLockScreen } from "@/components/dashboard/PremiumLockScreen";
import { Lock, Video, FileText, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { verifyContentAccess } from "@/lib/access-control";

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

    // Resolve Context User Profile
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userProfile = { id: "", role: "student", plan_id: undefined, is_subscribed: isSubscribed, owned_content_ids: [] as string[] };
    if (user) {
        const { data: dbUser } = await supabase.from('profiles').select('role, plan_id, is_subscribed').eq('id', user.id).single();
        if (dbUser) {
            userProfile = {
                id: user.id,
                role: dbUser.role,
                plan_id: dbUser.plan_id,
                is_subscribed: dbUser.is_subscribed || isSubscribed,
                owned_content_ids: isOwned && lesson ? [lesson.id] : []
            };
        }
    }

    let hasAccess = false;
    let accessErrorReason = "";

    if (lesson) {
        const accessCheck = await verifyContentAccess(userProfile, {
            id: lesson.id,
            required_plan_id: lesson.required_plan_id,
            is_free: lesson.is_free,
            is_active: lesson.is_active
        });
        hasAccess = accessCheck.allowed;
        accessErrorReason = accessCheck.reason || "unknown";
    }

    // Fetch Secure Token (Parallel)
    let secureVideoData: { videoId: string, token: string } | null = null;
    let accessError = null;

    try {
        if (lesson && hasAccess) {
            // Attempt to get token ONLY since we verified access
            secureVideoData = await getSecureVideoId(lessonId);
        }
    } catch (e) {
        // Access might be denied here, we handle it visually below
        accessError = e;
    }

    if (error || !lesson || accessError) {
        return (
            <div className="w-full aspect-video bg-zinc-950 rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-red-500/5 blur-3xl rounded-full" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/20">
                        <Lock className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                    <p className="text-zinc-400 max-w-sm mb-6">
                        {accessError instanceof Error ? accessError.message : "You do not have the required subscription to view this lesson. Please upgrade your plan."}
                    </p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        Refresh Session
                    </button>
                </div>
            </div>
        );
    }

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

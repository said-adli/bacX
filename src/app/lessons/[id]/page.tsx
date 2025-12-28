"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Loader2, Lock, FileText, Download, PlayCircle, ChevronLeft } from "lucide-react";
import { DynamicWatermark } from "@/components/security/DynamicWatermark";
import Link from "next/link";
import { toast } from "sonner";
import { LessonSkeleton } from "@/components/skeletons/LessonSkeleton";
import { RetryCard } from "@/components/ui/RetryCard";

interface Lesson {
    title: string;
    description: string;
    videoUrl: string; // This is the YouTube ID
    pdfUrl?: string; // Optional PDF link
    subject: string;
    duration?: string;
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    // React 19: Unwrap params
    const { id } = use(params);

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [denied, setDenied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLesson = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Check Subscription (Client-side fail-fast, real security is Firestore Rules)
            const userRef = doc(db, "users", user!.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();

            if (userData?.role !== 'admin' && !userData?.isSubscribed) {
                setDenied(true);
                setLoading(false);
                return;
            }

            // 2. Fetch Lesson
            const lessonRef = doc(db, "lessons", id);
            const lessonSnap = await getDoc(lessonRef);

            if (lessonSnap.exists()) {
                setLesson(lessonSnap.data() as Lesson);
                setDenied(false);
            } else {
                toast.error("الدرس غير موجود");
                router.push("/lessons");
            }
        } catch (err: unknown) {
            console.error(err);
            const errorCode = (typeof err === 'object' && err !== null && 'code' in err)
                ? (err as { code: string }).code
                : '';

            if (errorCode === 'permission-denied') {
                setDenied(true);
            } else {
                setError("فشل في تحميل الدرس. يرجى التحقق من الاتصال.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/auth");
            return;
        }
        fetchLesson();
    }, [user, authLoading, id, router]);


    // --- LOADING STATE (SKELETON) ---
    if (authLoading || loading) {
        return <LessonSkeleton />;
    }

    // --- ERROR STATE (RETRY) ---
    if (error) {
        return <RetryCard onRetry={fetchLesson} error={error} />;
    }

    // --- ACCESS DENIED STATE ---
    if (denied) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 relative">
                        <Lock className="w-10 h-10 text-red-500" />
                        <div className="absolute inset-0 border border-red-500/20 rounded-full animate-ping" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2 font-tajawal">عذراً، هذا المحتوى مغلق</h1>
                    <p className="text-zinc-400 mb-8 font-tajawal leading-relaxed">
                        هذا الدرس متاح حصرياً للمشتركين في الباقة الذهبية. اشترك الآن لتتمكن من الوصول إلى جميع الدروس والملفات.
                    </p>
                    <div className="space-y-3">
                        <Link href="/subscription">
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12">
                                ترقية الحساب (Upgrade)
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">
                                العودة للرئيسية
                            </Button>
                        </Link>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (!lesson) return null;

    // --- SUCCESS STATE (THE PLAYER) ---
    return (
        <main className="min-h-screen bg-[#050505] text-white font-tajawal">
            {/* Header / Nav Back */}
            <div className="p-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span>العودة للرئيسية</span>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- MAIN PLAYER (Left/Top) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl shadow-primary/5 group">
                        <iframe
                            src={`https://www.youtube.com/embed/${lesson.videoUrl}?modestbranding=1&rel=0&controls=1`}
                            className="w-full h-full object-cover"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        {/* THE WATERMARK */}
                        <DynamicWatermark user={user} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{lesson.subject}</span>
                            <span>• {lesson.duration || "25 min"}</span>
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR (Right) --- */}
                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            ملفات الدرس
                        </h3>

                        {lesson.pdfUrl ? (
                            <a
                                href={lesson.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-200 group-hover:text-white">ملخص الدرس (PDF)</div>
                                        <div className="text-xs text-zinc-500">2.5 MB</div>
                                    </div>
                                </div>
                                <Download className="w-5 h-5 text-zinc-500 group-hover:text-primary" />
                            </a>
                        ) : (
                            <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-white/10 rounded-xl">
                                لا توجد ملفات مرفقة لهذا الدرس
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg mb-4">وصف الدرس</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                            {lesson.description || "لا يوجد وصف متاح."}
                        </p>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
}

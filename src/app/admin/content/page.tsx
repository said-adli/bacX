import { useState, useEffect } from "react";
import { collection, addDoc, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Radio, Video, Loader2, Save } from "lucide-react";

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'live'>('lessons');
    const [loading, setLoading] = useState(false);

    // Live State
    const [liveUrl, setLiveUrl] = useState("");
    const [isLiveActive, setIsLiveActive] = useState(false);

    // Lesson State
    const [lessonForm, setLessonForm] = useState({
        title: "",
        subject: "الرياضيات", // Default
        videoUrl: "", // YouTube ID
        duration: "",
        thumbnail: "",
        order: 1
    });

    useEffect(() => {
        // Fetch Live Config
        async function fetchLive() {
            try {
                const docSnap = await getDoc(doc(db, "config", "live"));
                if (docSnap.exists()) {
                    setLiveUrl(docSnap.data().url || "");
                    setIsLiveActive(docSnap.data().isActive || false);
                }
            } catch (e) {
                console.error("Live config error", e);
            }
        }
        fetchLive();
    }, []);

    const handleSaveLive = async () => {
        setLoading(true);
        try {
            await setDoc(doc(db, "config", "live"), {
                url: liveUrl,
                isActive: isLiveActive,
                updatedAt: Timestamp.now()
            });
            toast.success("تم تحديث إعدادات البث المباشر");
        } catch (error) {
            toast.error("فشل التحديث");
        } finally {
            setLoading(false);
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "lessons"), {
                ...lessonForm,
                createdAt: Timestamp.now(),
                order: Number(lessonForm.order)
            });
            toast.success("تمت إضافة الدرس بنجاح");
            setLessonForm({ ...lessonForm, title: "", videoUrl: "" }); // Reset some fields
        } catch {
            toast.error("فشل إضافة الدرس");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">إدارة المحتوى</h1>

                <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        الدروس
                    </button>
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                        البث المباشر
                    </button>
                </div>
            </div>

            {activeTab === 'live' ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-full ${isLiveActive ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`}>
                            <Radio className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">حالة البث المباشر</h2>
                            <p className="text-zinc-400 text-sm">تفعيل هذا الخيار سيظهر البث لجميع المشتركين</p>
                        </div>
                        <div className="mr-auto">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isLiveActive}
                                    onChange={(e) => setIsLiveActive(e.target.checked)}
                                />
                                <div className="w-14 h-7 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400">رابط الفيديو (YouTube Embed URL)</label>
                        <input
                            type="text"
                            placeholder="https://www.youtube.com/embed/..."
                            value={liveUrl}
                            onChange={(e) => setLiveUrl(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl p-4 focus:ring-1 focus:ring-red-500 outline-none"
                        />
                    </div>

                    <button
                        onClick={handleSaveLive}
                        disabled={loading}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" />}
                        حفظ الإعدادات
                    </button>
                </div>
            ) : (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-500" />
                        إضافة درس جديد
                    </h2>

                    <form onSubmit={handleAddLesson} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">عنوان الدرس</label>
                                <input
                                    required
                                    value={lessonForm.title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-white/30 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">المادة</label>
                                <select
                                    value={lessonForm.subject}
                                    onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-white/30 outline-none text-white"
                                >
                                    {["الرياضيات", "الفيزياء", "العلوم", "اللغات", "الفلسفة"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-1">معرف الفيديو (YouTube ID)</label>
                            <input
                                required
                                value={lessonForm.videoUrl}
                                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                placeholder="ex: dQw4w9WgXcQ"
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-white/30 outline-none font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">المدة</label>
                                <input
                                    value={lessonForm.duration}
                                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                    placeholder="20:00"
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-white/30 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">الترتيب</label>
                                <input
                                    type="number"
                                    value={lessonForm.order}
                                    onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-white/30 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
                            نشر الدرس
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

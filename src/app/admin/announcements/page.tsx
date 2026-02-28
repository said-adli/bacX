import { getAdminAnnouncements, deleteAnnouncement, createAnnouncement } from "@/actions/announcements";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trash2, Plus, Bell } from "lucide-react";
import { format } from "date-fns";
import { arMA } from "date-fns/locale";

export const metadata = {
  title: "إدارة الإعلانات",
};


// Announcement shape from database
interface Announcement {
    id: string;
    title: string | null;
    content: string;
    created_at: string;
    is_active: boolean;
}

export default async function AdminAnnouncementsPage() {
    const announcements: Announcement[] = await getAdminAnnouncements();

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">إدارة الإعلانات</h1>
                    <p className="text-white/40">نشر تحديثات وإعلانات للطلاب</p>
                </div>
            </div>

            {/* Create Form */}
            <GlassCard className="p-6 border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-blue-400" />
                    إعلان جديد
                </h3>
                <form action={createAnnouncement} className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-1">العنوان</label>
                        <input
                            name="title"
                            type="text"
                            placeholder="مثال: تحديث جديد للمنصة"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">المحتوى *</label>
                        <textarea
                            name="content"
                            required
                            rows={4}
                            placeholder="تفاصيل الإعلان..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 outline-none transition-colors resize-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            نشر الإعلان
                        </button>
                    </div>
                </form>
            </GlassCard>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">الإعلانات السابقة ({announcements.length})</h3>

                {announcements.length === 0 ? (
                    <div className="text-center py-12 text-white/30 border border-white/5 rounded-2xl border-dashed">
                        لا توجد إعلانات حتى الآن
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {announcements.map((item) => (
                            <GlassCard key={item.id} className="p-4 flex items-start justify-between border-white/5 group bg-white/[0.02]">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                        <Bell size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">{item.title || "بدون عنوان"}</h4>
                                        <p className="text-white/60 text-sm line-clamp-2 max-w-2xl mb-2">{item.content}</p>
                                        <div className="text-xs text-white/30 font-mono">
                                            {format(new Date(item.created_at), 'PPP p', { locale: arMA })}
                                        </div>
                                    </div>
                                </div>
                                <form action={deleteAnnouncement.bind(null, item.id)}>
                                    <button
                                        type="submit"
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </form>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

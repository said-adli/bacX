import { getAdminSchedules, deleteSchedule, createSchedule } from "@/actions/schedule";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trash2, Plus, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { arMA } from "date-fns/locale";

interface Schedule {
    id: string;
    title: string;
    description: string | null;
    event_date: string;
    type: string;
    created_at: string;
}

export default async function AdminSchedulePage() {
    const schedules: Schedule[] = await getAdminSchedules();

    const getTypeDetails = (type: string) => {
        switch (type) {
            case 'live_class': return { label: 'حصة مباشرة', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Clock };
            case 'exam': return { label: 'اختبار', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: BookOpen };
            case 'deadline': return { label: 'موعد نهائي', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle };
            default: return { label: 'أخرى', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Calendar };
        }
    };

    return (
        <div className="space-y-8" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">جدول المواعيد</h1>
                    <p className="text-white/40">إدارة الحصص المباشرة، الاختبارات، والمواعيد القادمة في المنصة</p>
                </div>
            </div>

            {/* Create Form */}
            <GlassCard className="p-6 border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-blue-400" />
                    إضافة موعد جديد
                </h3>
                <form action={createSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-white/60 mb-1">العنوان *</label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="مثال: حصة مراجعة الرياضيات"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">نوع الموعد *</label>
                        <select
                            name="type"
                            required
                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 outline-none transition-colors"
                        >
                            <option value="live_class">حصة مباشرة</option>
                            <option value="exam">اختبار</option>
                            <option value="deadline">موعد نهائي</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1">تاريخ ووقت الموعد *</label>
                        <input
                            name="event_date"
                            type="datetime-local"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 outline-none transition-colors [color-scheme:dark]"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm text-white/60 mb-1">وصف إضافي (اختياري)</label>
                        <textarea
                            name="description"
                            rows={2}
                            placeholder="تفاصيل الموعد أو روابط الدخول..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500/50 outline-none transition-colors resize-none"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-2">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            حفظ الموعد
                        </button>
                    </div>
                </form>
            </GlassCard>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">المواعيد القادمة ({schedules.length})</h3>

                {schedules.length === 0 ? (
                    <div className="text-center py-12 text-white/30 border border-white/5 rounded-2xl border-dashed">
                        لا توجد مواعيد مبرمجة حالياً
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedules.map((item) => {
                            const details = getTypeDetails(item.type);
                            const Icon = details.icon;
                            return (
                                <GlassCard key={item.id} className="p-0 border-white/5 group bg-white/[0.02] flex flex-col justify-between overflow-hidden relative">
                                    <div className="p-5 flex-1 relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border border-white/5 flex items-center gap-1.5 ${details.bg} ${details.color}`}>
                                                <Icon size={12} />
                                                <span>{details.label}</span>
                                            </div>
                                            <form action={deleteSchedule.bind(null, item.id)}>
                                                <button
                                                    type="submit"
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </form>
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-1.5 line-clamp-2">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-white/50 text-sm line-clamp-2 mb-4">{item.description}</p>
                                        )}
                                    </div>
                                    <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-xs text-white/60 font-mono z-10">
                                        <span>{format(new Date(item.event_date), 'dd MMM yyyy', { locale: arMA })}</span>
                                        <span className="bg-white/5 px-2 py-1 rounded-md">{format(new Date(item.event_date), 'HH:mm')}</span>
                                    </div>

                                    {/* Decorative Icon Background */}
                                    <Icon size={80} className={`absolute -bottom-4 -left-4 opacity-5 ${details.color}`} />
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

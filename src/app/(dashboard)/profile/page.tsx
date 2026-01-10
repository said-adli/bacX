export default function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Profile Header */}
            <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[#0A0A0F] border-4 border-[#0A0A0F] flex items-center justify-center overflow-hidden">
                            <span className="text-4xl">👤</span>
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0A0A0F] hidden md:block" />
                </div>

                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold font-serif">سعيد عدلي</h1>
                    <p className="text-white/60">طالب علوم رياضية (أ)</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm border border-blue-500/20">مشترك مميز 🌟</span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm border border-white/10">المستوى: 15</span>
                    </div>
                </div>

                <button className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                    تعديل الملف
                </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-2">المعلومات الشخصية</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-white/40">البريد الإلكتروني</span>
                            <span>said.adli@example.com</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">رقم الهاتف</span>
                            <span>06 12 34 56 78</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">المدينة</span>
                            <span>الدار البيضاء</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-2">إحصائيات الأداء</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>التقدم العام</span>
                                <span className="text-blue-400">75%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>الحضور</span>
                                <span className="text-green-400">92%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-green-500 w-[92%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

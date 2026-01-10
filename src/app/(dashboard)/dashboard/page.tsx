export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-l from-white to-white/60">
                    لوحة القيادة
                </h1>
                <p className="text-lg text-blue-400 font-serif">
                    "إنَّ اللهَ يَقْذِفُ العِلْمَ فِي قُلُوبِ مَنْ يُحِبُّ"
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "الدورات المكتملة", value: "3", sub: "من أصل 12" },
                    { label: "ساعات التعلم", value: "24.5", sub: "هذا الشهر" },
                    { label: "النقاط المكتسبة", value: "850", sub: "مستوى متقدم" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex flex-col gap-2">
                        <span className="text-sm text-white/40">{stat.label}</span>
                        <span className="text-3xl font-bold font-serif">{stat.value}</span>
                        <span className="text-xs text-white/30">{stat.sub}</span>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-xl font-bold">آخر الدروس</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    ▶
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">مقدمة في الفيزياء الكمية</h4>
                                    <p className="text-xs text-white/40">الفصل الثالث • 45 دقيقة</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-xl font-bold">الإعلانات</h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-200">
                                <span className="font-bold block mb-1">تذكير هام:</span>
                                موعد الحصة المباشرة القادمة يوم الأحد الساعة 8:00 مساءً.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-white/60">
                                تم تحديث محتوى مادة الرياضيات للفصل الثاني.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

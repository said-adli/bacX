export default function LiveSessionsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-serif font-bold text-white">الحصص المباشرة</h1>

            <div className="w-full h-64 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-blue-900/50 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700" />
                <div className="text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        مباشر الآن
                    </div>
                    <h2 className="text-3xl font-bold">مراجعة شاملة: الدوال الأسية</h2>
                    <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all">
                        انضم للدرس
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">الحصص القادمة</h3>
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="glass-card p-4 flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-xl font-bold">12</span>
                            <span className="text-xs text-white/50">يناير</span>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold">حل تمارين الأعداد العقدية</h4>
                            <p className="text-sm text-white/50">الأستاذ محمد كريم • الساعة 20:00</p>
                        </div>
                        <div className="mr-auto">
                            <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors border border-white/10">
                                تذكيرني
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

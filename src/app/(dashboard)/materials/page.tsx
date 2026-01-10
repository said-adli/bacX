export default function MaterialsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold text-white">المواد الدراسية</h1>
                <button className="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl">
                    تصفح المزيد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {["الرياضيات", "الفيزياء", "الكيمياء", "علوم الحياة والأرض", "الفلسفة", "اللغة الإنجليزية"].map((subject, i) => (
                    <div key={i} className="glass-card group p-6 hover:bg-white/10 transition-all cursor-pointer">
                        <div className="h-32 w-full rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4 flex items-center justify-center text-4xl">
                            📚
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{subject}</h3>
                        <p className="text-sm text-white/50">12 وحدة دراسية • 45 درس</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

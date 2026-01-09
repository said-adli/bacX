// ============================================================================
// BRAINY DASHBOARD - HOME PAGE
// ============================================================================
// Placeholder content for the new dashboard
// ============================================================================

export default function DashboardPage() {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <section className="text-center py-20">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 bg-clip-text text-transparent">
                        مرحباً بك في Brainy
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                    منصة التعلم الذكي المصممة لمستقبلك. تعلم بشكل أسرع، أذكى، وأفضل.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <StatCard
                        icon="📚"
                        value="+1000"
                        label="درس متاح"
                    />
                    <StatCard
                        icon="🎯"
                        value="98%"
                        label="نسبة النجاح"
                    />
                    <StatCard
                        icon="⚡"
                        value="24/7"
                        label="دعم متواصل"
                    />
                </div>
            </section>

            {/* Features Grid - Placeholder */}
            <section className="py-16">
                <h2 className="text-3xl font-bold mb-8 text-center">ابدأ رحلتك</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard
                        title="الدروس المباشرة"
                        description="تعلم مع أفضل المعلمين في بث مباشر"
                        gradient="from-purple-500 to-pink-500"
                    />
                    <FeatureCard
                        title="التمارين الذكية"
                        description="تمارين تتكيف مع مستواك"
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <FeatureCard
                        title="المكتبة الشاملة"
                        description="آلاف الفيديوهات والموارد"
                        gradient="from-emerald-500 to-green-500"
                    />
                </div>
            </section>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl mb-4">{icon}</div>
            <div className="text-4xl font-bold text-white mb-2">{value}</div>
            <div className="text-gray-400">{label}</div>
        </div>
    );
}

// Feature Card Component
function FeatureCard({ title, description, gradient }: { title: string; description: string; gradient: string }) {
    return (
        <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden cursor-pointer">
            {/* Gradient Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                    <span>استكشف</span>
                    <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

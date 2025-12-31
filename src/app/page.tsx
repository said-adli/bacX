import Link from "next/link";
import { ArrowLeft, Check, Video, Users, BookOpen, Trophy, Shield, Zap, Brain } from "lucide-react";
import { getPlatformStats, formatStatDisplay } from "@/lib/stats-service";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const stats = await getPlatformStats();

  // Format stats with zero-state handling
  const studentsDisplay = stats.totalStudents === 0
    ? 'انضم أولاً!'
    : `${stats.totalStudents.toLocaleString()}+`;

  const lessonsDisplay = stats.totalLessons === 0
    ? 'قريباً...'
    : `${stats.totalLessons}+`;

  return (
    <div dir="rtl" className="min-h-screen bg-white font-sans">
      {/* Header — Notion Style */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[rgba(55,53,47,0.09)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#37352F] rounded flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[#37352F]">Brainy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#787774]">
            <a href="#features" className="hover:text-[#37352F] transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-[#37352F] transition-colors">الباقات</a>
            <a href="/about" className="hover:text-[#37352F] transition-colors">عن المنصة</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth?mode=login" className="text-sm text-[#787774] hover:text-[#37352F] px-3 py-1.5 rounded hover:bg-[#F7F7F5] transition-colors">
              الدخول
            </Link>
            <Link href="/auth?mode=signup" className="btn-notion btn-primary text-sm">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — Clean & Minimal */}
        <section className="py-24 lg:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#37352F] leading-tight mb-6">
              منصة التفوق <br />الأكاديمي
            </h1>

            <p className="text-lg text-[#787774] max-w-xl mx-auto mb-10 leading-relaxed">
              محتوى تعليمي منظم ومتكامل لطلاب البكالوريا،
              بإشراف نخبة من الأساتذة المتخصصين.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth?mode=signup" className="btn-notion btn-blue px-6 py-2.5">
                ابدأ الآن مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="#features" className="btn-notion btn-ghost px-6 py-2.5">
                اكتشف المزيد
              </Link>
            </div>

            {/* Stats - Real data only, no fake success rate */}
            <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-[rgba(55,53,47,0.09)]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#37352F]">{studentsDisplay}</div>
                <div className="text-sm text-[#9B9A97]">طالب</div>
              </div>
              <div className="w-px h-8 bg-[rgba(55,53,47,0.09)]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#37352F]">{lessonsDisplay}</div>
                <div className="text-sm text-[#9B9A97]">درس</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features — Block Style */}
        <section id="features" className="py-20 bg-[#F7F7F5]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#37352F] mb-3">
                لماذا Brainy؟
              </h2>
              <p className="text-[#787774]">
                كل ما تحتاجه للتفوق في البكالوريا
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Video, title: "محتوى مرئي", desc: "دروس مسجلة بدقة عالية" },
                { icon: Users, title: "أساتذة نخبة", desc: "مصححون معتمدون" },
                { icon: BookOpen, title: "منهج منظم", desc: "وفق البرنامج الرسمي" },
                { icon: Trophy, title: "تمارين محلولة", desc: "مع التصحيح النموذجي" },
                { icon: Zap, title: "حصص مباشرة", desc: "للمراجعة والأسئلة" },
                { icon: Shield, title: "دعم مستمر", desc: "فريق متاح للمساعدة" }
              ].map((feature, i) => (
                <div key={i} className="p-5 bg-white rounded-xl hover:shadow-[var(--shadow-md)] transition-shadow">
                  <div className="w-9 h-9 rounded-lg bg-[#F7F7F5] flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-[#37352F]" />
                  </div>
                  <h3 className="font-semibold text-[#37352F] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#787774]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing — Notion Table Style */}
        <section id="pricing" className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#37352F] mb-3">
                خطط بسيطة وواضحة
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Free */}
              <div className="p-6 border border-[rgba(55,53,47,0.09)] rounded-xl">
                <h3 className="font-semibold text-[#37352F] mb-1">المجاني</h3>
                <p className="text-sm text-[#9B9A97] mb-4">للتجربة</p>
                <div className="text-3xl font-bold text-[#37352F] mb-6">0 دج</div>
                <ul className="space-y-2 mb-6">
                  {["دروس تجريبية", "جودة HD", "ملخصات"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#787774]">
                      <Check className="w-4 h-4 text-[#0F7B6C]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?mode=signup" className="btn-notion btn-ghost w-full justify-center border border-[rgba(55,53,47,0.16)]">
                  ابدأ مجاناً
                </Link>
              </div>

              {/* Monthly */}
              <div className="p-6 border-2 border-[#2383E2] rounded-xl relative">
                <div className="absolute -top-3 right-4 px-2 py-0.5 bg-[#2383E2] text-white text-xs rounded">
                  الأكثر مرونة
                </div>
                <h3 className="font-semibold text-[#37352F] mb-1">الشهري</h3>
                <p className="text-sm text-[#9B9A97] mb-4">دفع مرن</p>
                <div className="text-3xl font-bold text-[#37352F] mb-6">2,500 <span className="text-base font-normal">دج/شهر</span></div>
                <ul className="space-y-2 mb-6">
                  {["جميع الدروس", "الحصص المباشرة", "التمارين", "دعم VIP"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#787774]">
                      <Check className="w-4 h-4 text-[#0F7B6C]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/subscription" className="btn-notion btn-blue w-full justify-center">
                  اختيار
                </Link>
              </div>

              {/* Yearly */}
              <div className="p-6 bg-[#37352F] text-white rounded-xl">
                <h3 className="font-semibold mb-1">السنوي</h3>
                <p className="text-sm text-[#9B9A97] mb-4">توفير شهرين</p>
                <div className="text-3xl font-bold mb-6">15,000 <span className="text-base font-normal">دج/سنة</span></div>
                <ul className="space-y-2 mb-6">
                  {["كل الشهري +", "توفير 5000 دج", "أولوية دعم", "مراجعة نهائية"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-white/70" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/subscription" className="btn-notion bg-white text-[#37352F] w-full justify-center hover:bg-white/90">
                  اختيار
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — Minimal */}
      <footer className="py-8 border-t border-[rgba(55,53,47,0.09)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#37352F] rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-[#37352F]">Brainy</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#9B9A97]">
            <Link href="/about" className="hover:text-[#37352F]">عن المنصة</Link>
            <a href="#" className="hover:text-[#37352F]">الشروط</a>
            <a href="#" className="hover:text-[#37352F]">الخصوصية</a>
          </div>
          <p className="text-sm text-[#9B9A97]">© 2024 Brainy</p>
        </div>
      </footer>
    </div>
  );
}

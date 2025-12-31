import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Check, Video, Users, BookOpen, Trophy, Shield, Zap, Brain } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getServerSideStats() {
  try {
    const usersColl = collection(db, "users");
    const lessonsColl = collection(db, "lessons");
    const [usersSnapshot, lessonsSnapshot] = await Promise.all([
      getCountFromServer(usersColl),
      getCountFromServer(lessonsColl)
    ]);
    return {
      usersCount: usersSnapshot.data().count,
      lessonsCount: lessonsSnapshot.data().count
    };
  } catch {
    return { usersCount: 1000, lessonsCount: 50 };
  }
}

export default async function Page() {
  const stats = await getServerSideStats();

  return (
    <div dir="rtl" className="min-h-screen font-sans relative">
      {/* Mesh Gradient Background */}
      <div className="mesh-gradient" />

      {/* Header — Fluid Glass */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="glass-card py-3 px-6 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Brainy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-800 transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-slate-800 transition-colors">الباقات</a>
            <a href="/about" className="hover:text-slate-800 transition-colors">عن المنصة</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth?mode=login" className="text-sm text-slate-500 hover:text-slate-800">
              الدخول
            </Link>
            <Link href="/auth?mode=signup" className="btn-fluid btn-primary text-sm py-2.5 px-5">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO — Fluid & Inspirational */}
        <section className="pt-32 pb-24 min-h-[80vh] flex items-center">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="glass-pill inline-flex items-center gap-2 px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-soft" />
              <span className="text-sm text-slate-600">Where Intelligence Meets Excellence</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
              منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Brainy</span><br />
              للتفوق الأكاديمي
            </h1>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              منصة تعليمية ذكية تقدم محتوى أكاديمي عالي الجودة،
              مُصمم بعناية لطلاب البكالوريا، بإشراف نخبة من الأساتذة المتخصصين.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth?mode=signup" className="btn-fluid btn-primary px-8 py-3.5">
                ابدأ رحلة التفوق
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="#features" className="btn-fluid btn-glass px-8 py-3.5">
                اكتشف المزيد
              </Link>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center justify-center gap-4 mt-16">
              <div className="glass-pill px-6 py-3 text-center">
                <div className="text-2xl font-bold text-slate-800">{stats.usersCount.toLocaleString()}+</div>
                <div className="text-xs text-slate-400">طالب ذكي</div>
              </div>
              <div className="glass-pill px-6 py-3 text-center">
                <div className="text-2xl font-bold text-slate-800">{stats.lessonsCount}+</div>
                <div className="text-xs text-slate-400">درس متاح</div>
              </div>
              <div className="glass-pill px-6 py-3 text-center">
                <div className="text-2xl font-bold text-slate-800">98%</div>
                <div className="text-xs text-slate-400">نسبة النجاح</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES — Floating Cards */}
        <section id="features" className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                لماذا <span className="text-blue-500">Brainy</span>؟
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                بيئة تعليمية ذكية صُممت لتحقيق أفضل النتائج
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Video, title: "محتوى مرئي احترافي", desc: "دروس مسجلة بدقة عالية مع شروحات مفصلة" },
                { icon: Users, title: "أساتذة نخبة", desc: "فريق من الأساتذة المصححين ذوي الخبرة" },
                { icon: BookOpen, title: "منهج منظم", desc: "محتوى مرتب وفق البرنامج الرسمي" },
                { icon: Trophy, title: "تمارين وامتحانات", desc: "مواضيع محلولة مع التصحيح النموذجي" },
                { icon: Zap, title: "حصص مباشرة", desc: "بثوث أسبوعية للمراجعة والأسئلة" },
                { icon: Shield, title: "دعم مستمر", desc: "فريق دعم متاح للإجابة على استفساراتكم" }
              ].map((feature, i) => (
                <div key={i} className="glass-card p-6 hover-swell">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING — Fluid Pills */}
        <section id="pricing" className="py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                خطط الاشتراك
              </h2>
              <p className="text-slate-500">اختر الباقة المناسبة لرحلتك</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free */}
              <div className="glass-card p-6 hover-swell">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">الباقة الأساسية</h3>
                <p className="text-sm text-slate-400 mb-4">للتجربة والاستكشاف</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-800">0</span>
                  <span className="text-slate-400 mr-1">دج</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["الدروس التجريبية", "جودة HD", "الملخصات"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?mode=signup" className="btn-fluid btn-glass w-full">
                  ابدأ مجاناً
                </Link>
              </div>

              {/* Monthly — Featured */}
              <div className="glass-card p-6 hover-swell relative border-2 border-blue-200">
                <div className="absolute -top-3 right-6 glass-pill px-4 py-1 text-xs font-medium text-blue-600 bg-blue-50">
                  الأكثر مرونة
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">الاشتراك الشهري</h3>
                <p className="text-sm text-slate-400 mb-4">مرونة الدفع الشهري</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-800">2,500</span>
                  <span className="text-slate-400 mr-1">دج/شهر</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["جميع الدروس", "الحصص المباشرة", "التمارين المحلولة", "مجموعة VIP"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/subscription" className="btn-fluid btn-primary w-full">
                  اختيار الباقة
                </Link>
              </div>

              {/* Yearly */}
              <div className="floating-panel p-6 hover-swell bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                <h3 className="text-lg font-semibold mb-1">الاشتراك السنوي</h3>
                <p className="text-sm text-slate-400 mb-4">توفير شهرين</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">15,000</span>
                  <span className="text-slate-400 mr-1">دج/سنة</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["كل مميزات الشهري", "توفير 5,000 دج", "المراجعة النهائية", "أولوية الدعم"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-blue-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/subscription" className="btn-fluid bg-white text-slate-800 hover:bg-slate-100 w-full">
                  اختيار الباقة
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER — Minimal */}
      <footer className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Brainy</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/about" className="hover:text-slate-600">عن المنصة</Link>
              <a href="#" className="hover:text-slate-600">الشروط</a>
              <a href="#" className="hover:text-slate-600">الخصوصية</a>
              <a href="#" className="hover:text-slate-600">تواصل معنا</a>
            </div>
            <p className="text-sm text-slate-400">© 2024 Brainy. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

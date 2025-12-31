import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { ArrowLeft, Check, Video, Users, BookOpen, Trophy, Shield, Zap } from "lucide-react";

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
    <div dir="rtl" className="min-h-screen bg-white font-sans">
      {/* Header — Enterprise Minimal */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            BACX
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">الباقات</a>
            <a href="/about" className="hover:text-slate-900 transition-colors">عن المنصة</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth?mode=login" className="text-sm text-slate-500 hover:text-slate-900">
              الدخول
            </Link>
            <Link href="/auth?mode=signup" className="btn btn-primary text-sm">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO — Minimalist Enterprise */}
        <section className="pt-32 pb-24 border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              المنصة التعليمية للبكالوريا
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              المرجع الأكاديمي<br />
              لطلاب البكالوريا
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              منصة تعليمية متكاملة تقدم محتوى أكاديمي عالي الجودة،
              مُصمم وفق البرنامج الوزاري الجديد، بإشراف نخبة من الأساتذة المتخصصين.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth?mode=signup" className="btn btn-primary px-8 py-3">
                ابدأ الآن مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="#features" className="btn btn-secondary px-8 py-3">
                اكتشف المزيد
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-12 mt-16 pt-8 border-t border-slate-100">
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.usersCount.toLocaleString()}+</div>
                <div className="text-sm text-slate-400">طالب مسجل</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.lessonsCount}+</div>
                <div className="text-sm text-slate-400">درس متاح</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div>
                <div className="text-3xl font-bold text-slate-900">98%</div>
                <div className="text-sm text-slate-400">نسبة النجاح</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES — Service Grid */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                الخدمات
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                ما نقدمه لك
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                بيئة تعليمية متكاملة صُممت لتحقيق أفضل النتائج الأكاديمية
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Video, title: "محتوى مرئي عالي الجودة", desc: "دروس مسجلة بدقة عالية مع شروحات مفصلة ومنهجية واضحة" },
                { icon: Users, title: "أساتذة معتمدون", desc: "فريق من الأساتذة المصححين للبكالوريا ذوي الخبرة الطويلة" },
                { icon: BookOpen, title: "منهج منظم", desc: "محتوى مرتب حسب الوحدات والفصول وفق البرنامج الرسمي" },
                { icon: Trophy, title: "تمارين وامتحانات", desc: "مواضيع محلولة ونماذج امتحانات مع التصحيح النموذجي" },
                { icon: Zap, title: "حصص مباشرة", desc: "بثوث أسبوعية للمراجعة والإجابة على أسئلة الطلاب" },
                { icon: Shield, title: "دعم مستمر", desc: "فريق دعم متاح للإجابة على استفساراتكم" }
              ].map((feature, i) => (
                <div key={i} className="panel p-6 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING — Corporate Service Tiers */}
        <section id="pricing" className="py-24 border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                خطط الاشتراك
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                اختر الباقة المناسبة
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Tier */}
              <div className="panel p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">الباقة الأساسية</h3>
                  <p className="text-sm text-slate-400 mt-1">للتجربة والاستكشاف</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">0</span>
                  <span className="text-slate-400 mr-1">دج</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["الدروس التجريبية المجانية", "جودة HD", "الوصول للملخصات"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-slate-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth?mode=signup" className="btn btn-secondary w-full">
                  ابدأ مجاناً
                </Link>
              </div>

              {/* Monthly Tier */}
              <div className="panel p-6 border-slate-900 relative">
                <div className="absolute top-0 right-4 -translate-y-1/2">
                  <span className="badge badge-neutral px-3 py-1">الأكثر مرونة</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">الاشتراك الشهري</h3>
                  <p className="text-sm text-slate-400 mt-1">مرونة الدفع الشهري</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">2,500</span>
                  <span className="text-slate-400 mr-1">دج/شهر</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["جميع الدروس والمواد", "الحصص المباشرة", "التمارين المحلولة", "مجموعة VIP", "دعم 7/7"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-slate-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/subscription" className="btn btn-primary w-full">
                  اختيار الباقة
                </Link>
              </div>

              {/* Yearly Tier */}
              <div className="panel p-6 bg-slate-900 text-white border-slate-900">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">الاشتراك السنوي</h3>
                  <p className="text-sm text-slate-400 mt-1">توفير شهرين مجاناً</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">15,000</span>
                  <span className="text-slate-400 mr-1">دج/سنة</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["كل مميزات الشهري", "توفير 5,000 دج", "المراجعة النهائية", "أولوية الدعم", "جلسات توجيهية"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-white" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/subscription" className="btn bg-white text-slate-900 hover:bg-slate-100 w-full">
                  اختيار الباقة
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER — Minimal */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-bold text-slate-900">BACX</div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/about" className="hover:text-slate-600">عن المنصة</Link>
              <a href="#" className="hover:text-slate-600">الشروط والأحكام</a>
              <a href="#" className="hover:text-slate-600">الخصوصية</a>
              <a href="#" className="hover:text-slate-600">تواصل معنا</a>
            </div>
            <p className="text-sm text-slate-400">© 2024 BACX. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

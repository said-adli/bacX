import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Pricing } from "@/components/sections/Pricing";
// import { TopNav } from "@/components/layout/TopNav";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Force dynamic rendering since we are fetching data
export const dynamic = 'force-dynamic';

async function getServerSideStats() {
  try {
    // We use getCountFromServer for cost-efficiency (doesn't read documents)
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
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { usersCount: 1000, lessonsCount: 50 }; // Fallback
  }
}

export default async function Page() {
  const stats = await getServerSideStats();

  return (
    <div dir="rtl" className="min-h-screen bg-background font-sans selection:bg-primary/30">
      {/* Header code ... */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tight text-foreground">
            BAC<span className="text-primary">X</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">الرئيسية</a>
            <a href="#features" className="hover:text-primary transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-primary transition-colors">الأسعار</a>
            <a href="/about" className="hover:text-primary transition-colors">من نحن</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/auth?mode=login" className="text-sm font-medium text-muted-foreground hover:text-foreground">تسجيل الدخول</a>
            <a href="/auth?mode=signup" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
              ابدأ مجاناً
            </a>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <Hero stats={stats} />
        <Features />
        <Pricing />

        {/* Footer */}
        <footer className="py-12 bg-muted/30 border-t border-border mt-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl font-black tracking-tight text-foreground mb-6">
              BAC<span className="text-primary">X</span>
            </div>
            <div className="flex justify-center gap-6 mb-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground">تواصل معنا</a>
              <a href="#" className="hover:text-foreground">الأحكام والشروط</a>
              <a href="#" className="hover:text-foreground">الخصوصية</a>
              <a href="/about" className="hover:text-primary">عن المنصة</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BacX. جميع الحقوق محفوظة.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

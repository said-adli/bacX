import { Metadata } from "next";
import dynamic from "next/dynamic";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { PricingSection } from "@/components/home/PricingSection";
import { AuthButton } from "@/components/marketing/AuthButton";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

// --- DYNAMIC IMPORTS (CODE SPLITTING) ---

// 1. HeroSection: SSR: true (Crucial for LCP/SEO, but deferred execution)
const HeroSection = dynamic(
  () => import("@/components/sections/HeroSection").then((mod) => mod.HeroSection),
  { ssr: true }
);

// 2. MasterclassSection: Client Component Wrapper (Handles ssr: false)
import { MasterclassLoader as MasterclassSection } from "@/components/home/MasterclassLoader";

export const metadata: Metadata = {
  title: "BRAINY - منصة التفوق الأكاديمي",
  description: "رحلة سينمائية نحو النجاح في البكالوريا. تعلم من أفضل الأساتذة في الجزائر بجودة 4K.",
};

export default function LandingPage() {
  // STATIC: No constraints. Plans passed as static data or handled by PricingSection internally if needed.
  const plans: any[] = []; // Passing empty for now to match prop type, enabling full static build.

  return (
    <div className="bg-background min-h-screen selection:bg-primary/30 overflow-hidden">

      {/* HEADER / NAVIGATION (Anti-Band Fixed & Transparent) - CLIENT AUTH */}
      <LandingNavbar
        authButton={<AuthButton />}
      />

      {/* 1. HERO SECTION (The Masterpiece) */}
      <HeroSection />

      {/* 2. THE MASTERCLASS EXPERIENCES (Parallax Cards) */}
      <MasterclassSection />

      {/* 3. PRICING (The Prestige) - Dynamic */}
      <PricingSection plans={plans} />

      {/* Footer */}
      <footer className="py-12 text-center text-white/30 border-t border-white/5">
        <p>&copy; 2026 Brainy. Crafted for Excellence.</p>
      </footer>
    </div>
  );
}

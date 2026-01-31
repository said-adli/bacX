import { Metadata } from "next";
import { Suspense } from "react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { MasterclassSection } from "@/components/home/MasterclassSection";
import { PricingSection } from "@/components/home/PricingSection";
import { getActivePlans } from "@/actions/admin-plans";
import { AuthStatusBtn } from "@/components/marketing/AuthStatusBtn";

export const metadata: Metadata = {
  title: "BRAINY - منصة التفوق الأكاديمي",
  description: "رحلة سينمائية نحو النجاح في البكالوريا. تعلم من أفضل الأساتذة في الجزائر بجودة 4K.",
};

export default function LandingPage() {
  // STATIC: No constraints. Plans passed as static data or handled by PricingSection internally if needed.
  // For "Force Static", we assume PricingSection can handle empty plans or fetch client-side if dynamic is absolutely needed,
  // but usually pricing is static.
  const plans: any[] = []; // Passing empty for now to match prop type, enabling full static build.

  return (
    <div className="bg-background min-h-screen selection:bg-primary/30 overflow-hidden">

      {/* HEADER / NAVIGATION (Anti-Band Fixed & Transparent) - CLIENT AUTH */}
      <LandingNavbar
        authButton={<AuthStatusBtn />}
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

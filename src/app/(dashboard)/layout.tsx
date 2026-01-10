import RightGlassSidebar from "@/components/dashboard/RightGlassSidebar";
import StickyGlassMenu from "@/components/dashboard/StickyGlassMenu";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V3 - CALM GLASS EDITION
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen text-white font-sans selection:bg-blue-500/30" dir="rtl">
            {/* Background is handled in globals.css (radial gradient) */}

            {/* Right Side Navigation */}
            <RightGlassSidebar />

            {/* Top Sticky Menu */}
            <StickyGlassMenu />

            {/* Main Content Area */}
            {/* mr-64 for sidebar space in RTL */}
            <main className="min-h-screen mr-64 pt-24 px-8 pb-10 relative z-0 transition-all duration-300 ease-in-out">
                {children}
            </main>
        </div>
    );
}

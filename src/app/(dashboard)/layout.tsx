import RightGlassSidebar from "@/components/dashboard/RightGlassSidebar";
import StickyGlassMenu from "@/components/dashboard/StickyGlassMenu";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V3 - CALM GLASS EDITION
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen text-white font-sans selection:bg-blue-500/30 bg-[#0B0E14] overflow-hidden" dir="rtl">

            {/* Dark Luxury Mesh Gradient Background */}
            <div className="fixed inset-0 z-0">
                {/* Base Deep Charcoal */}
                <div className="absolute inset-0 bg-[#0B0E14]" />

                {/* Ambient Glowing Blobs */}
                <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-[ambient-motion_20s_infinite]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-indigo-600/15 rounded-full blur-[120px] mix-blend-screen animate-[ambient-motion_25s_infinite_reverse]" />
                <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-[pulse_10s_infinite]" />

                {/* Cinematic Grain Overlay */}
                <div className="absolute inset-0 film-grain z-10" />
            </div>

            {/* Right Side Navigation */}
            <RightGlassSidebar />

            {/* Top Sticky Menu */}
            <StickyGlassMenu />

            {/* Main Content Area */}
            {/* Using mr-20 (collapsed width) + padding to allow content to be visible. 
                The Sidebar will expand OVER the content (glass effect). */}
            <main className="min-h-screen mr-0 md:mr-24 pt-28 px-4 md:px-12 pb-10 relative z-10 transition-all duration-300 ease-in-out">



                {/* THE SOUL */}
                <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                    <p className="text-sm md:text-base font-serif text-white/30 tracking-widest pointer-events-none select-none">
                        "إنَّ اللهَ يَقْذِفُ العِلْمَ فِي قَلْبِ مَنْ يُحِبُّ"
                    </p>
                </div>

                {children}
            </main>
        </div>
    );
}

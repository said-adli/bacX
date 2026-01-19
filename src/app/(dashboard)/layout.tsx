import RightGlassSidebar from "@/components/dashboard/RightGlassSidebar";
import StickyGlassMenu from "@/components/dashboard/StickyGlassMenu";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V3 - CALM GLASS EDITION
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen text-white font-sans selection:bg-blue-500/30 bg-[radial-gradient(circle_at_top,_#111827_0%,_#050505_100%)]" dir="rtl">

            {/* Right Side Navigation */}
            <RightGlassSidebar />

            {/* Top Sticky Menu */}
            <StickyGlassMenu />

            {/* Main Content Area */}
            {/* Using mr-20 (collapsed width) + padding to allow content to be visible. 
                The Sidebar will expand OVER the content (glass effect). */}
            <main className="min-h-screen mr-0 md:mr-24 pt-32 px-4 md:px-12 pb-10 relative z-0 transition-all duration-300 ease-in-out">

                {/* Ultra-Glass Background Blobs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
                    <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

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

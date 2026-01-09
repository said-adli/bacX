import { GlassSidebar } from "@/components/layout/GlassSidebar";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V3 - THE WORKSHOP
// ============================================================================
// Glassmorphic design with sliding right sidebar
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex" dir="rtl">
            {/* Sliding Glass Sidebar (Right) */}
            <GlassSidebar />

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen p-6 lg:p-10 relative z-0">
                {/* Background Noise/Gradient (Optional for V3 feel) */}
                <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-[-1]" />
                <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-[-1]" />

                {children}
            </main>
        </div>
    );
}

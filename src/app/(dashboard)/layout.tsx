import { BrainyNav } from "@/components/layout/BrainyNav";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V2 - MINIMALIST & FUTURISTIC
// ============================================================================
// Clean slate with transparent pill navigation
// ============================================================================

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
            {/* Floating Transparent Pill Nav */}
            <BrainyNav />

            {/* Main Content Area */}
            <main className="min-h-screen pt-24 px-6 lg:px-12">
                {children}
            </main>
        </div>
    );
}

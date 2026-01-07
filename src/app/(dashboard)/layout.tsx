import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

// PURE SERVER COMPONENT - No auth, no effects, no blocking
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans" dir="rtl">
            {/* Sidebar - Client Island */}
            <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-40 border-l border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <div className="lg:mr-72 min-h-screen">
                <header className="sticky top-0 z-30 h-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl">
                    <TopNav />
                </header>

                <main className="p-6 lg:p-10">
                    <Suspense fallback={
                        <div className="w-full h-[calc(100vh-10rem)] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    }>
                        {children}
                    </Suspense>
                </main>
            </div>

            <BottomNav />
        </div>
    );
}

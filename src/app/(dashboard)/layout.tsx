import { SidebarProvider } from "@/context/SidebarContext";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DashboardBackground } from "@/components/dashboard/DashboardBackground";

// ============================================================================
// BRAINY DASHBOARD LAYOUT V3 - CALM GLASS EDITION (With Collapsible Sidebar)
// ============================================================================

import { NotificationProvider } from "@/context/NotificationContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { RealtimeSystemStatus } from "@/components/dashboard/RealtimeSystemStatus";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <NotificationProvider>
                <PlayerProvider>
                    <RealtimeSystemStatus />

                    {/* Dark Luxury Mesh Gradient Background (Extracted to Client Island) */}
                    <DashboardBackground />

                    <DashboardShell>
                        {/* THE SOUL */}
                        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
                            <p className="text-lg md:text-xl font-serif text-white/40 tracking-widest pointer-events-none select-none drop-shadow-md">
                                {`"إنَّ اللهَ يَقْذِفُ العِلْمَ فِي قَلْبِ مَنْ يُحِبُّ"`}
                            </p>
                        </div>
                        {children}
                    </DashboardShell>
                </PlayerProvider >
            </NotificationProvider >
        </SidebarProvider >
    );
}

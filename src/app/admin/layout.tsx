import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { verifyAdmin } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Strict Server-Side Security Check
    // This runs on every request to /admin/*
    try {
        await verifyAdmin();
    } catch (error) {
        // If verification fails, strict redirect to home or login
        // We could also show a 403 page, but redirect is safer to get them out
        console.error("Admin Access Denied:", error);
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Background Ambient Glows */}
            <div className="fixed left-0 top-0 -z-10 h-full w-full overflow-hidden bg-black">
                <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute -right-[10%] bottom-[20%] h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
            </div>

            <AdminSidebar />

            <div className="pl-64">
                <AdminHeader />
                <main className="min-h-[calc(100vh-4rem)] p-8 pt-0">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

"use client";

import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth');
            } else if (role !== 'admin') {
                router.push('/dashboard');
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
        );
    }

    if (!user || role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans" dir="rtl">
            <AdminSidebar />
            <main className="mr-64 p-8 min-h-screen bg-black/95">
                {children}
            </main>
        </div>
    );
}

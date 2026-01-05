"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    // STRICT GUARD: Do not attempt to render AppShell or Sidebar until we are SURE we have a user.
    // This prevents hydration mismatches and null pointer exceptions in child components.
    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <AppShell>
            <BackButton />
            {children}
        </AppShell>
    );
}

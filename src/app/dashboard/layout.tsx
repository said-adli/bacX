"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading, checkProfileStatus } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/auth/login");
                return;
            }

            const status = checkProfileStatus(user, profile);
            if (status === "REQUIRE_ONBOARDING") {
                router.replace("/complete-profile");
            }
        }
    }, [user, profile, loading, router, checkProfileStatus]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#020617]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null; // Will redirect

    return <>{children}</>;
}

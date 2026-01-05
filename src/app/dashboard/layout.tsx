"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading, checkProfileStatus } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace("/auth/login");
                return;
            }

            const check = async () => {
                const isComplete = await checkProfileStatus();
                if (!isComplete) {
                    router.replace("/complete-profile");
                }
            };
            check();
        }
    }, [user, loading, router, checkProfileStatus]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    // While redirecting, show skeleton to prevent flash
    if (!user) return <DashboardSkeleton />;

    return <>{children}</>;
}

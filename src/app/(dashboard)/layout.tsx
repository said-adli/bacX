import { AppShell } from "@/components/layout/AppShell";
import { BackButton } from "@/components/ui/BackButton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppShell>
            <BackButton />
            {children}
        </AppShell>
    );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionCookie } from "@/lib/auth-jwt";
import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("bacx_session")?.value;

    if (!sessionCookie) {
        redirect("/auth");
    }

    // Verify session
    const claims = await verifySessionCookie(sessionCookie);

    if (!claims) {
        redirect("/auth");
    }

    // Fetch data on the server
    const data = await getDashboardData((claims.uid as string) || (claims.sub as string));

    return <DashboardView initialData={data} />;
}

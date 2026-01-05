import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/dashboard";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { AuthHydrator } from "@/components/auth/AuthHydrator";

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Verify Session & Get User
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // 2. Fetch Dashboard Data (Server-Side)
    const data = await getDashboardData(user.id);

    // 3. Render
    return (
        <>
            <AuthHydrator profile={data.userProfile} />
            <DashboardView initialData={data} />
        </>
    );
}

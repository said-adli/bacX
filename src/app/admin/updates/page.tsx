import { createClient } from "@/utils/supabase/server";
import UpdatesPageClient from "@/components/admin/updates/UpdatesPageClient";

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
    const supabase = await createClient();

    const { data: updates } = await supabase
        .from("platform_updates")
        .select("*")
        .order("created_at", { ascending: false });

    return <UpdatesPageClient updates={updates || []} />;
}

import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import SettingsForm from "./SettingsForm";
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton";

export const dynamic = 'force-dynamic';

async function SettingsPageContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    // Fetch Email Preference (Fast Single Query)
    const { data } = await supabase
        .from("profiles")
        .select("email_notifications")
        .eq("id", user.id)
        .single();

    return (
        <SettingsForm
            initialEmailPrefs={data?.email_notifications ?? true}
        />
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SettingsPageContent />
        </Suspense>
    );
}

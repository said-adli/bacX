import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import SettingsForm from "./SettingsForm";
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton";
import { getUserSettings } from "@/services/user.service";

export const metadata = {
  title: "إعدادات الحساب",
};



async function SettingsPageContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    // Fetch via Service Layer
    const { emailNotifications } = await getUserSettings(user.id);

    return (
        <SettingsForm
            initialEmailPrefs={emailNotifications}
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

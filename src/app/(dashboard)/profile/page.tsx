import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import ProfileForm from "./ProfileForm";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { getPendingChangeRequest } from "@/actions/profile";

export const dynamic = 'force-dynamic';

async function ProfilePageContent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    // Fetch All Data in Parallel
    const [
        { data: profile },
        { data: branches },
        { data: wilayas },
        { data: pendingRequest }
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('branches').select('id, name').order('name'),
        supabase.from('wilayas').select('id, name_ar, name_en').order('id'),
        getPendingChangeRequest()
    ]);

    return (
        <ProfileForm
            initialProfile={profile}
            branches={branches || []}
            wilayas={wilayas || []}
            pendingRequest={pendingRequest}
        />
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfileSkeleton />}>
            <ProfilePageContent />
        </Suspense>
    );
}

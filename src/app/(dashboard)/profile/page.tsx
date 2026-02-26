import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import ProfileForm, { ProfileEditorDTO, PendingRequestDTO } from "./ProfileForm";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { getPendingChangeRequest } from "@/actions/profile";


// 1. A dedicated Async Component for fetching the heavy data
async function ProfileDataStream({ userId }: { userId: string }) {
    const supabase = await createClient();

    // Fetch All Data in Parallel
    const [
        { data: profile },
        { data: branches },
        { data: wilayas },
        { data: pendingRequest }
    ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, wilaya_id, major_id, study_system, bio, role').eq('id', userId).single(),
        supabase.from('branches').select('id, name').order('name'),
        supabase.from('wilayas').select('id, name_ar, name_en').order('id'),
        getPendingChangeRequest()
    ]);

    // DTO MAPPERS: Strip all internal DB metadata before crossing to Client
    const safeProfile: ProfileEditorDTO | null = profile ? {
        id: profile.id,
        full_name: profile.full_name,
        wilaya_id: profile.wilaya_id,
        major_id: profile.major_id,
        study_system: profile.study_system,
        bio: profile.bio,
        role: profile.role,
    } : null;

    const safePendingRequest: PendingRequestDTO | null = pendingRequest ? {
        id: pendingRequest.id,
        created_at: pendingRequest.created_at,
        status: pendingRequest.status,
    } : null;

    return (
        <ProfileForm
            initialProfile={safeProfile}
            branches={branches || []}
            wilayas={wilayas || []}
            pendingRequest={safePendingRequest}
        />
    );
}

// 2. The Page Shell - Only blocks on the ultra-fast Auth check
export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-wide border-r-4 border-blue-500 pr-4">الملف الشخصي</h1>
                <p className="text-white/40 mt-2 mr-5">إدارة حسابك، بياناتك الشخصية، وتفضيلاتك</p>
            </div>

            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileDataStream userId={user.id} />
            </Suspense>
        </div>
    );
}

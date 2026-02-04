import { getLastAccessedLesson } from "@/actions/progress";
import ContinueWatching from "./ContinueWatching";

import { User } from "@supabase/supabase-js";

export default async function ContinueWatchingSection({ user }: { user: User }) {
    // Fetch data on server
    const lastLesson = await getLastAccessedLesson(user.id);

    // Pass to Client Component
    return <ContinueWatching initialData={lastLesson as any} userId={user.id} />;
}

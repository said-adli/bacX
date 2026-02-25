import { getLastAccessedLesson } from "@/actions/progress";
import ContinueWatching from "./ContinueWatching";

import { SafeUser } from "@/lib/dto";

export default async function ContinueWatchingSection({ user }: { user: SafeUser }) {
    // Fetch data on server
    const lastLesson = await getLastAccessedLesson(user.id);

    // Pass to Client Component
    return <ContinueWatching initialData={lastLesson} userId={user.id} />;
}

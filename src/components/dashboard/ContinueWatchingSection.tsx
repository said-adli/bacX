import { getLastAccessedLesson } from "@/actions/progress";
import ContinueWatching from "./ContinueWatching";

export default async function ContinueWatchingSection() {
    // Fetch data on server
    const lastLesson = await getLastAccessedLesson();

    // Pass to Client Component
    return <ContinueWatching initialData={lastLesson as any} />;
}

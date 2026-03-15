import { getUnifiedLiveContext } from "@/actions/live";
import { UnifiedLiveHub } from "@/components/live/UnifiedLiveHub";

export const metadata = {
  title: "البث المباشر",
};

export const dynamicParams = true;
// Keep force-dynamic since it depends on cookies for getUnifiedLiveContext
export const dynamic = 'force-dynamic';

export default async function LiveSessionsPage() {
    // No contextId passed = uses fallback to latest active session
    const event = await getUnifiedLiveContext(undefined, 'session');

    return <UnifiedLiveHub initialEvent={event} layoutVariant="fullscreen" />;
}

import { getHybridLiveSession } from "@/actions/live";
import { LiveSessionClient, SecureSession } from "@/components/live/LiveSessionClient";

export const dynamic = 'force-dynamic';

export default async function LiveSessionsPage() {
    let secureSession: SecureSession = {
        authorized: false,
        isLive: false,
        error: "Connection failed"
    };

    try {
        const data = await getHybridLiveSession();
        secureSession = {
            authorized: data.authorized,
            isLive: !!data.isLive,
            title: data.title,
            youtubeId: data.youtubeId,
            liveToken: data.liveToken,
            error: data.error,
            user: data.user
        };
    } catch {
        // Leave the default error state
    }

    return <LiveSessionClient initialSession={secureSession} />;
}

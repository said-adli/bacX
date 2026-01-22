import { getRecentNotifications, getSystemStatus } from "@/actions/admin-controls";
import GlobalControlsClient from "@/components/admin/controls/GlobalControlsClient";

export default async function ControlsPage() {
    const recentNotifications = await getRecentNotifications();
    const systemSettings = await getSystemStatus();

    return <GlobalControlsClient recentNotifications={recentNotifications || []} initialSettings={systemSettings} />;
}

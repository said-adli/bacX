import { getRecentNotifications } from "@/actions/admin-controls";
import GlobalControlsClient from "@/components/admin/controls/GlobalControlsClient";

export default async function ControlsPage() {
    const recentNotifications = await getRecentNotifications();

    return <GlobalControlsClient recentNotifications={recentNotifications || []} />;
}


import { getDeviceSessions } from "@/actions/admin-security";
import DeviceSecurityClient from "@/components/admin/security/DeviceSecurityClient";

export const dynamic = "force-dynamic";

export default async function DeviceSecurityPage() {
    const sessions = await getDeviceSessions();

    return <DeviceSecurityClient sessions={sessions || []} />;
}

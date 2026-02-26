import { getSecurityLogs } from "@/actions/admin-logs";
import LogsPage from "@/components/admin/logs/LogsPageClient";

export const metadata = {
    title: "سجلات الأمان",
};

export default async function LogsParamsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const filter = (searchParams.filter as 'all' | 'admin_only' | 'system') || 'all';

    // Fetch logs based on filter param
    const logsData = await getSecurityLogs(1, filter);

    return <LogsPage initialLogs={logsData} />;
}

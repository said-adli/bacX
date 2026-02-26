import { getStudentRequests } from "@/lib/actions/requests";
import RequestTabs from "@/components/admin/requests/RequestTabs";

export const metadata = {
  title: "طلبات التعديل",
};


export default async function RequestsPage() {
    const { data: requests, error } = await getStudentRequests();

    if (error) {
        return (
            <div className="container mx-auto max-w-7xl p-6">
                <div className="text-red-400 text-center py-8">
                    خطأ: {error}
                </div>
            </div>
        );
    }

    return <RequestTabs requests={requests} />;
}

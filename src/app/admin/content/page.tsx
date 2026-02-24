import { getContentTree } from "@/actions/admin-content";
import { getActivePlans } from "@/actions/admin-plans";
import ContentTree from "@/components/admin/content/ContentTree";

export default async function ContentPage() {
    const subjects = await getContentTree();
    const activePlans = await getActivePlans(); // For access control selector

    return (
        <div className="container mx-auto max-w-[1600px] h-full">
            <h2 className="text-3xl font-bold text-white mb-6">مركز إدارة المحتوى</h2>
            <ContentTree subjects={subjects} activePlans={activePlans} />
        </div>
    );
}

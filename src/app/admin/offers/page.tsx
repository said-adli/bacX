import { getAdminPlans } from "@/actions/admin-plans";
import OffersPageClient from "@/components/admin/offers/OffersPageClient";

export const metadata = {
  title: "إدارة العروض",
};


export default async function OffersPage() {
    const plans = await getAdminPlans();

    return <OffersPageClient plans={plans} />;
}

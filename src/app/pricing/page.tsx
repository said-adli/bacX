import { getActivePlans } from "@/actions/admin-plans";
import PricingClient from "./PricingClient";

export const metadata = {
    title: "خطط الأسعار",
    description: "اختر الباقة التي تناسبك وابدأ رحلة التفوق مع نخبة أساتذة الجزائر."
};

export default async function PricingPage() {
    const plans = await getActivePlans();

    return (
        <PricingClient plans={plans} />
    );
}

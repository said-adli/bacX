import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { getActivePlans, SubscriptionPlan } from "@/actions/admin-plans";
import { SubscriptionClient } from "@/components/dashboard/SubscriptionClient";
import { Loader2 } from "lucide-react";
import { toSafeBillingHistoryDTO, SafeBillingHistory } from "@/lib/dto";

export const metadata = {
  title: "تفاصيل الاشتراك",
};


// Inner Server Component that fetches heavy/user-specific data
async function SubscriptionHistoryStream({ userId, activePlans }: { userId: string | undefined, activePlans: SubscriptionPlan[] }) {
    let history: SafeBillingHistory[] = [];

    if (userId) {
        const supabase = await createClient();
        const { data } = await supabase
            .from('billing_history')
            .select('id, amount, status, date, method, receipt_url')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (data) {
            history = data.map(toSafeBillingHistoryDTO);
        }
    }

    return <SubscriptionClient initialPlans={activePlans} initialHistory={history} />;
}

export default async function SubscriptionPage() {
    const supabase = await createClient();

    // Fast Parallel Fetching (Auth + Public Plans)
    const [authRes, activePlans] = await Promise.all([
        supabase.auth.getUser(),
        getActivePlans()
    ]);

    const user = authRes.data.user;

    return (
        <div className="space-y-6">
            <Suspense fallback={
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            }>
                <SubscriptionHistoryStream userId={user?.id} activePlans={activePlans} />
            </Suspense>
        </div>
    );
}

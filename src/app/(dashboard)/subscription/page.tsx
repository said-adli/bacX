import { createClient } from "@/utils/supabase/server";
import { getActivePlans } from "@/actions/admin-plans";
import { SubscriptionClient } from "@/components/dashboard/SubscriptionClient";

export default async function SubscriptionPage() {
    const supabase = await createClient();

    // We fetch data in parallel for optimal Server rendering speed
    const [authRes, activePlans] = await Promise.all([
        supabase.auth.getUser(),
        getActivePlans()
    ]);

    const user = authRes.data.user;
    let history: any[] = [];

    if (user) {
        const { data } = await supabase
            .from('billing_history')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (data) history = data;
    }

    // Hand over state down to the client boundary
    return <SubscriptionClient initialPlans={activePlans} initialHistory={history} />;
}

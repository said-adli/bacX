import { createClient } from "@/utils/supabase/server";
import { SubscriptionCards } from "./SubscriptionCards";

import { User } from "@supabase/supabase-js";

export default async function SmartSubscriptionCards({ user }: { user: User }) {
    const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser(); // ELIMINATED

    // if (!user) return null; // Handled by parent

    // Fetch profile to check subscription
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_subscribed')
        .eq('id', user.id)
        .single();

    // If subscribed, don't show the upsell cards
    if (profile?.is_subscribed) {
        return null;
    }

    // If not subscribed, show the cards
    return <SubscriptionCards />;
}

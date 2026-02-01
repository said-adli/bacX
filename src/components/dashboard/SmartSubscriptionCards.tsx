import { createClient } from "@/utils/supabase/server";
import { SubscriptionCards } from "./SubscriptionCards";

export default async function SmartSubscriptionCards() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

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

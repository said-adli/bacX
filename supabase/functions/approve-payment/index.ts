import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No Authorization header');

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // 1. Verify User (Middleware has confirmed they have a token, but we check Role)
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error("Unauthorized")
        }

        // 2. Service Role Client for Admin Operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Verify Admin Role
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Admin only' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        interface ApprovePaymentBody {
            paymentId?: string;
            userId?: string;
            durationDays?: number;
        }

        const { paymentId, userId, durationDays = 30 } = (await req.json()) as ApprovePaymentBody

        if (!paymentId || !userId) {
            throw new Error("Missing parameters")
        }

        // 4. Update Payment Status
        const { error: paymentError } = await supabaseAdmin
            .from('payment_receipts')
            .update({
                status: 'approved',
                updated_at: new Date().toISOString()
            })
            .eq('id', paymentId)

        if (paymentError) throw paymentError

        // 5. Update User Subscription
        const subscriptionEnd = new Date()
        subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays)

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                is_subscribed: true,
                subscription_end_date: subscriptionEnd.toISOString()
            })
            .eq('id', userId)

        if (profileError) throw profileError

        return new Response(
            JSON.stringify({ success: true, message: 'Payment approved' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})

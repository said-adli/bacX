import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

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

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error("Unauthorized")
        }

        const { deviceId, deviceName } = await req.json()
        if (!deviceId || !deviceName) throw new Error("Missing device info")

        // Service Role for managing profile data strictly
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('active_devices, role')
            .eq('id', user.id)
            .single()

        const devices = (profile?.active_devices as any[]) || []
        const MAX_DEVICES = 2

        // Check existing
        const existingIndex = devices.findIndex((d: any) => d.deviceId === deviceId)

        if (existingIndex !== -1) {
            // Update last seen
            devices[existingIndex].lastSeen = new Date().toISOString()
            await supabaseAdmin
                .from('profiles')
                .update({ active_devices: devices })
                .eq('id', user.id)

            return new Response(
                JSON.stringify({ success: true, message: 'Device updated' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Check limit
        if (devices.length >= MAX_DEVICES && profile?.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: `Device limit (${MAX_DEVICES}) reached. Remove a device first.` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
            )
        }

        // Add new
        const newDevice = {
            deviceId,
            deviceName,
            registeredAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        }

        devices.push(newDevice)

        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ active_devices: devices })
            .eq('id', user.id)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({ success: true, message: 'Device registered' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})

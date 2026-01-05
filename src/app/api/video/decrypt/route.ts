import { NextResponse } from 'next/server';
import {
    checkRateLimitDistributed,
    videoRateLimiter,
    getClientIp,
    createRateLimitResponse
} from '@/lib/rate-limit';
import { createClient } from "@/utils/supabase/server";

// CRITICAL: No fallback. Fail-closed if not set.
const SERVER_SALT = process.env.VIDEO_ENCRYPTION_SALT;

export async function POST(request: Request) {
    // 1. DISTRIBUTED RATE LIMITING
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimitDistributed(
        `video:${clientIp}`,
        videoRateLimiter,
        { maxRequests: 10, windowMs: 60000 }
    );

    if (!rateLimitResult.success) {
        console.warn(`[RATE LIMIT] Video decrypt blocked for IP: ${clientIp}`);
        return createRateLimitResponse(rateLimitResult);
    }

    // 2. ENVIRONMENT CHECK - Fail-closed
    if (!SERVER_SALT) {
        console.error('[CRITICAL] VIDEO_ENCRYPTION_SALT not configured!');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    // 3. SESSION VALIDATION (SUPABASE)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // 4. DECODE VIDEO ID
    try {
        const body = await request.json();
        const { encodedId } = body;

        if (!encodedId) {
            return NextResponse.json({ error: 'Missing encodedId' }, { status: 400 });
        }

        const decodedString = Buffer.from(encodedId, 'base64').toString('utf-8');

        if (decodedString.startsWith(SERVER_SALT) && decodedString.endsWith(SERVER_SALT)) {
            const realId = decodedString.slice(SERVER_SALT.length, -SERVER_SALT.length);

            return NextResponse.json(
                { videoId: realId },
                {
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString()
                    }
                }
            );
        } else {
            console.error(`[SECURITY] Salt mismatch for user ${userId}, IP ${clientIp}`);
            return NextResponse.json({ error: 'Integrity check failed' }, { status: 403 });
        }
    } catch (error) {
        console.error("Decryption API Error", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

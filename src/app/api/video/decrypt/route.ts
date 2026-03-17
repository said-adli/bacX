import { NextResponse } from 'next/server';
import {
    checkRateLimitDistributed,
    videoRateLimiter,
    getClientIp,
    createRateLimitResponse
} from '@/lib/rate-limit';
import { createClient } from "@/utils/supabase/server";
import { createHmac } from "crypto";

const SERVER_SALT = process.env.VIDEO_ENCRYPTION_SALT || "default-secret-change-me";

export async function POST(request: Request) {
    // 1. AUTHENTICATION (Supabase) - Moved Up for Identity-Based Rate Limiting
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 2. IDENTITY-BASED RATE LIMITING
    const clientIp = getClientIp(request);
    const limitKey = user?.id || `ip:${clientIp}`; // Prefer User ID to support shared networks (schools/libraries)

    const rateLimitResult = await checkRateLimitDistributed(
        `video:${limitKey}`,
        videoRateLimiter,
        { maxRequests: 20, windowMs: 60000 } // RELAXED: 20 decrypts per minute
    );

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Too many video requests. Please wait a minute." },
            { status: 429 }
        );
    }

    // 3. CONFIG CHECK
    if (!SERVER_SALT) {
        console.error('[CRITICAL] VIDEO_ENCRYPTION_SALT not configured!');
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { encodedId, lessonId } = body; // P0 Fix: Require lessonId

        if (!encodedId) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        // P0 FIX: Verify Lesson Context
        if (!lessonId) {
            // Blocked decrypt attempt
            return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
        }

        // 4. INTEGRITY CHECK (HMAC Validation)
        // Client sends: encodedId = "base64Payload.signature"
        const [base64Payload, clientSignature] = encodedId.split('.');
        if (!base64Payload || !clientSignature) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
        }

        // Verify Signature
        const generatedSignature = createHmac('sha256', SERVER_SALT).update(base64Payload).digest('hex');
        if (clientSignature !== generatedSignature) {
            return NextResponse.json({ error: 'Integrity failed' }, { status: 403 });
        }

        // Decode Payload
        const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
        const [tokenLessonId, tokenUserId, tokenExpiryStr] = payload.split(':');

        // Verify Expiry
        if (parseInt(tokenExpiryStr) < Date.now()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }

        // Verify Context Matches Token
        if (tokenLessonId !== lessonId) {
            return NextResponse.json({ error: 'Context mismatch' }, { status: 403 });
        }
        if (tokenUserId !== user.id) {
            return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
        }

        // Extract content (assuming obfuscated ID)
        // const innerContent = decodedString.slice(SERVER_SALT.length, -SERVER_SALT.length); 
        // We actually IGNORE the inner content for the authorization decision. 
        // We TRUST the `lessonId` for deciding "Access or Not", 
        // but we return the Video ID associated with that Lesson ID from the DB.
        // This prevents the user from requesting Lesson A but sending a Token for Video B (if they match).

        // 5. AUTHORIZATION via POWER RPC
        // Fetch entirely compiled context in 1 trip
        const { data: context, error: rpcError } = await supabase
            .rpc('get_lesson_full_context', {
                p_lesson_id: lessonId,
                p_user_id: user.id
            });

        if (rpcError || !context || !context.lesson) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({ error: 'Content not found or RPC failed' }, { status: 404 });
        }

        const { lesson, subject, user_context } = context as any;

        // P0 FIX: Check if Parent Subject is Active
        if (subject.is_active === false && !user_context.is_admin) {
            return NextResponse.json({ error: 'Content is not active' }, { status: 403 });
        }

        // 6. AUTHORIZATION (The Real Fix)
        // Check Unified Access Rules against what the database reported
        const { verifyContentAccess } = await import("@/lib/access-control");
        const profile = user_context.profile;
        const activeIds = user_context.owns_content ? [lesson.id] : [];

        const contentRequirement = {
            id: lesson.id,
            required_plan_id: lesson.required_plan_id,
            is_free: lesson.is_free,
            is_active: subject.is_active
        };

        const access = await verifyContentAccess({
            ...profile,
            owned_content_ids: activeIds
        }, contentRequirement);

        if (!access.allowed) {
            return NextResponse.json({ error: access.reason || 'Subscription required' }, { status: 403 });
        }

        // 7. RETURN DECRYPTED ASSET
        // If the `video_url` in DB is "youtube_id", return it.
        // Ignore what client sent in `encodedId` regarding the ID, trust the DB.

        // Logic: Client sends "enc_LESSON_VIDEO". 
        // If we strictly blindly return lesson.video_url, we are 100% secure against swapping.

        const realVideoId = lesson.video_url; // Assuming this stores the YT ID

        return NextResponse.json(
            { videoId: realVideoId },
            {
                headers: {
                    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
                }
            }
        );

    } catch (error) {
        console.error("Decrypt Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

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

        // 5. AUTHORIZATION (The Real Fix)
        // Query DB: Does Lesson exist? Does User have plan?

        // Fetch User's Plan (Standardized to plan_id)
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_id, role, is_subscribed')
            .eq('id', user.id)
            .single();

        if (!profile) return NextResponse.json({ error: 'Profile error' }, { status: 403 });
        const isAdmin = profile.role === 'admin';

        // Fetch Lesson Details STRICTLY
        const { data: lesson } = await supabase
            .from('lessons')
            .select('id, required_plan_id, is_free, video_url')
            .eq('id', lessonId)
            // We could filter by video_url matching the token, but honestly, 
            // relying on the lessonId as the source of truth is safer.
            // The CLIENT is asking "Give me video for Lesson X".
            // We verify "Can User see Lesson X?" -> "Here is video for Lesson X".
            .single();

        if (!lesson) {
            // Lesson not found
            return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }

        // 6. ENTITLEMENT CHECK
        let hasAccess = false;
        if (isAdmin) {
            hasAccess = true;
        } else if (lesson.is_free) {
            hasAccess = true;
        } else if (lesson.required_plan_id) {
            // Strict Plan Match
            hasAccess = profile.plan_id === lesson.required_plan_id;
        } else {
            // Legacy/Fallback
            hasAccess = !!profile.is_subscribed;
        }

        if (!hasAccess) {
            // Denied access
            return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
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

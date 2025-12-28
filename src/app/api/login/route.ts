import { NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin"; // Use centralized init
import {
    checkRateLimitDistributed,
    loginRateLimiter,
    getClientIp,
    createRateLimitResponse
} from "@/lib/rate-limit";

// Firebase Admin already initialized in @/lib/firebase-admin

export async function POST(request: Request) {
    // 1. RATE LIMITING - Prevent credential stuffing
    const clientIp = getClientIp(request);
    const rateLimitResult = await checkRateLimitDistributed(
        `login:${clientIp}`,
        loginRateLimiter,
        { maxRequests: 5, windowMs: 60000 } // 5 attempts per minute
    );

    if (!rateLimitResult.success) {
        console.warn(`[RATE LIMIT] Login blocked for IP: ${clientIp}`);
        return createRateLimitResponse(rateLimitResult);
    }

    try {
        const body = await request.json() as unknown;
        const idToken = (body && typeof body === 'object' && 'idToken' in body) ? (body as Record<string, unknown>).idToken : null;

        if (!idToken || typeof idToken !== 'string') {
            return NextResponse.json({ error: "Missing or invalid ID token" }, { status: 400 });
        }

        // Set session expiration to 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        // Create the session cookie
        const sessionCookie = await admin
            .auth()
            .createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ success: true });

        // Set the cookie with secure options
        response.cookies.set("bacx_session", sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        return response;
    } catch (error: unknown) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

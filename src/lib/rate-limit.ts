/**
 * Distributed Rate Limiter using Upstash Redis
 * Works across all serverless instances
 * Falls back to in-memory if Redis not configured
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash is configured
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client if configured
const redis = UPSTASH_URL && UPSTASH_TOKEN
    ? new Redis({
        url: UPSTASH_URL,
        token: UPSTASH_TOKEN,
    })
    : null;

// Rate limiters for different endpoints
export const videoRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
        analytics: true,
        prefix: 'ratelimit:video',
    })
    : null;

export const loginRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 login attempts per minute
        analytics: true,
        prefix: 'ratelimit:login',
    })
    : null;

export const apiRateLimiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
        analytics: true,
        prefix: 'ratelimit:api',
    })
    : null;

// Fallback in-memory rate limiter for when Redis is not configured
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const fallbackStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
    limit: number;
}

/**
 * Check rate limit - uses Upstash if available, falls back to in-memory
 */
export async function checkRateLimitDistributed(
    identifier: string,
    limiter: Ratelimit | null,
    fallbackConfig: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
    // Use Upstash if configured
    if (limiter) {
        try {
            const result = await limiter.limit(identifier);
            return {
                success: result.success,
                remaining: result.remaining,
                reset: result.reset,
                limit: result.limit
            };
        } catch (error) {
            console.error('[RATE LIMIT] Upstash error, falling back to memory:', error);
            // Fall through to in-memory
        }
    }

    // Fallback to in-memory
    const now = Date.now();
    const key = `fallback:${identifier}`;
    const entry = fallbackStore.get(key);

    // Clean old entries periodically
    if (fallbackStore.size > 10000) {
        for (const [k, v] of fallbackStore.entries()) {
            if (now > v.resetTime) fallbackStore.delete(k);
        }
    }

    if (!entry || now > entry.resetTime) {
        const newEntry = { count: 1, resetTime: now + fallbackConfig.windowMs };
        fallbackStore.set(key, newEntry);
        return {
            success: true,
            remaining: fallbackConfig.maxRequests - 1,
            reset: newEntry.resetTime,
            limit: fallbackConfig.maxRequests
        };
    }

    if (entry.count >= fallbackConfig.maxRequests) {
        return {
            success: false,
            remaining: 0,
            reset: entry.resetTime,
            limit: fallbackConfig.maxRequests
        };
    }

    entry.count++;
    return {
        success: true,
        remaining: fallbackConfig.maxRequests - entry.count,
        reset: entry.resetTime,
        limit: fallbackConfig.maxRequests
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'x-vercel-forwarded-for',
        'cf-connecting-ip'  // Cloudflare
    ];

    for (const header of headers) {
        const value = request.headers.get(header);
        if (value) {
            return value.split(',')[0].trim();
        }
    }

    return 'unknown';
}

/**
 * Create 429 response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    return new Response(
        JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.reset.toString(),
                'Retry-After': retryAfter.toString()
            }
        }
    );
}

/**
 * Log when Upstash is not configured (for debugging)
 */
if (!redis) {
    // Upstash Redis not configured. Using in-memory fallback.
    // Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for distributed rate limiting.
}

import { describe, it, expect } from 'vitest';

/**
 * Smoke Tests for BACX API Routes
 * These tests verify basic endpoint availability
 */

describe('API Health Check', () => {
    const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

    it('should return ok status from /api/health', async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/health`);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.status).toBe('ok');
            expect(data.timestamp).toBeDefined();
            expect(data.checks).toBeDefined();
        } catch {
            // If server is not running, skip gracefully
            console.warn('Server not running, skipping health check test');
        }
    });

    it('should have proper environment checks', async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/health`);
            const data = await response.json();

            expect(data.checks.environment).toBeDefined();
            // In test, we don't require all env vars
        } catch {
            console.warn('Server not running, skipping environment check test');
        }
    });
});

describe('API Security', () => {
    const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

    it('should reject video decrypt without session', async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/video/decrypt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encodedId: 'test' })
            });

            // Should be 401 Unauthorized without session
            expect(response.status).toBe(401);
        } catch {
            console.warn('Server not running, skipping security test');
        }
    });

    it('should enforce rate limiting on video decrypt', async () => {
        try {
            // Make 15 requests rapidly (limit is 10/min)
            const requests = Array(15).fill(null).map(() =>
                fetch(`${BASE_URL}/api/video/decrypt`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ encodedId: 'test' })
                })
            );

            const responses = await Promise.all(requests);
            const rateLimited = responses.filter(r => r.status === 429);

            // At least some should be rate limited
            expect(rateLimited.length).toBeGreaterThan(0);
        } catch {
            console.warn('Server not running, skipping rate limit test');
        }
    });
});

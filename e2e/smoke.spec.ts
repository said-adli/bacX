import { test, expect } from '@playwright/test';

/**
 * E2E Smoke Tests
 * Basic tests to verify critical user paths work
 */

test.describe('Public Pages', () => {
    test('homepage loads', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/BACX/i);
    });

    test('auth page loads', async ({ page }) => {
        await page.goto('/auth');
        await expect(page.locator('text=تسجيل الدخول')).toBeVisible();
    });
});

test.describe('Health Check', () => {
    test('health endpoint returns ok', async ({ request }) => {
        const response = await request.get('/api/health');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.status).toBe('ok');
    });
});

test.describe('Security', () => {
    test('protected routes redirect to auth', async ({ page }) => {
        await page.goto('/lessons/test-id');
        await expect(page).toHaveURL(/\/auth/);
    });

    test('admin routes redirect non-admins', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveURL(/\/(auth|$)/);
    });

    test('video decrypt requires auth', async ({ request }) => {
        const response = await request.post('/api/video/decrypt', {
            data: { encodedId: 'test' }
        });
        expect(response.status()).toBe(401);
    });

    test('rate limiting works', async ({ request }) => {
        // Make 15 rapid requests
        const requests = [];
        for (let i = 0; i < 15; i++) {
            requests.push(
                request.post('/api/video/decrypt', {
                    data: { encodedId: 'test' }
                })
            );
        }

        const responses = await Promise.all(requests);
        const rateLimited = responses.filter(r => r.status() === 429);

        // Some should be rate limited
        expect(rateLimited.length).toBeGreaterThan(0);
    });
});

test.describe('Accessibility', () => {
    test('auth page has proper heading structure', async ({ page }) => {
        await page.goto('/auth');

        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();
    });
});

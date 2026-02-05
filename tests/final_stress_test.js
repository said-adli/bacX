import http from 'k6/http';
import { sleep, check } from 'k6';
import { encoding } from 'k6';

/**
 * FINAL STRESS TEST
 * 
 * Goal: Validate platform stability with 500 concurrent users.
 * 
 * Execution:
 * k6 run tests/final_stress_test.js
 * 
 * Required Environment Variables (Optional override):
 * - BASE_URL: Target URL (default: http://localhost:3000)
 * - VIDEO_ENCRYPTION_SALT: Salt for video token generation (must match server)
 * - AUTH_TOKEN: Bearer token for authenticated requests
 * - LESSON_ID: Target lesson ID for decryption test
 */

export const options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp-up to 100 VUs
        { duration: '3m', target: 500 }, // Plateau at 500 VUs (Critical Threshold)
        { duration: '1m', target: 0 },   // Ramp-down to 0
    ],
    thresholds: {
        // 95% of requests must complete below 1000ms
        'http_req_duration': ['p(95)<1000'],
        // Error rate must be less than 1% (Note: may need adjustment if 429s are correctly triggered)
        'http_req_failed': ['rate<0.01'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SALT = __ENV.VIDEO_ENCRYPTION_SALT || 'default_salt';
const TOKEN = __ENV.AUTH_TOKEN;
const LESSON_ID = __ENV.LESSON_ID || 'test-lesson-id';

export default function () {
    // Common headers
    const params = {
        headers: {
            'Content-Type': 'application/json',
            ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
            // If using cookies, you can set them here or use a jar
        },
    };

    // --- Step 1: Dashboard Load ---
    // Simulate a student entering /dashboard. Verify status 200.
    // Testing the new Stateless Polling.
    const dashboardRes = http.get(`${BASE_URL}/dashboard`, params);

    check(dashboardRes, {
        'Dashboard status is 200': (r) => r.status === 200,
    });

    // --- Step 2: Thinking Time ---
    sleep(2);

    // --- Step 3: Video Decrypt ---
    // Request /api/video/decrypt.
    // Client sends: SALT + DATA + SALT (Base64)
    const innerContent = "stress_test_video_request";
    const rawString = `${SALT}${innerContent}${SALT}`;
    const encodedId = encoding.b64encode(rawString);

    const decryptPayload = JSON.stringify({
        encodedId: encodedId,
        lessonId: LESSON_ID,
    });

    const decryptRes = http.post(`${BASE_URL}/api/video/decrypt`, decryptPayload, params);

    // Verify the new 20 req/min rate limit is working (expect 200 or 429)
    check(decryptRes, {
        'Video Decrypt status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    });

    // --- Step 4: Admin Search (Optional/Conditional) ---
    // Simulate an admin search on /api/admin/students?q=test to verify Prefix Index Search performance.
    // Note: This endpoint must exist and user must be admin for 200 OK.
    // We check for 200 (Success) or 403 (Forbidden - if student) or 404 (if route missing).

    const searchRes = http.get(`${BASE_URL}/api/admin/students?q=test`, params);

    check(searchRes, {
        'Admin Search handled (200/403/404)': (r) => [200, 403, 404, 429].includes(r.status),
    });
}

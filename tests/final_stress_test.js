import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { b64encode } from 'k6/encoding';

export const options = {
    stages: [
        { duration: '2m', target: 100 }, // Ramp-up تدريجي باش ما يشكش فينا الـ Firewall
        { duration: '3m', target: 500 }, // الثبات عند 500 مستخدم (القمة)
        { duration: '1m', target: 0 },   // Ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1500'], // رفعنا السقف شوية لـ 1.5ثانية لأن الضغط عالي
        'http_req_failed': ['rate<0.05'],    // نقبلوا 5% أخطاء بسبب الـ Rate Limits والـ Timeouts
    },
};

// إعدادات البيئة
const BASE_URL = __ENV.BASE_URL || 'https://www.brainydz.me';
const SALT = __ENV.VIDEO_ENCRYPTION_SALT || 'your_actual_salt';
const TOKEN = __ENV.AUTH_TOKEN || ''; // إذا عندك Token حطه هنا

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
        },
    };

    // 1. التلميذ يدخل للداشبورد (كل التلاميذ يديروها)
    group('Student Dashboard', function () {
        const res = http.get(`${BASE_URL}/dashboard`, params);
        check(res, { 'Dashboard Loaded (200)': (r) => r.status === 200 });
        sleep(Math.random() * 3 + 2); // وقت تفكير عشوائي بين 2 و 5 ثواني
    });

    // 2. تلميذ يقرر يشوف فيديو (70% من المستخدمين برك يديروها في كل دورة)
    if (Math.random() < 0.7) {
        group('Video Interaction', function () {
            const innerContent = "stress_test_request";
            const encodedId = b64encode(`${SALT}${innerContent}${SALT}`);

            const payload = JSON.stringify({ encodedId: encodedId, lessonId: 'lesson-123' });
            const res = http.post(`${BASE_URL}/api/video/decrypt`, payload, params);

            check(res, { 'Video Decrypt OK/Limit': (r) => [200, 429].includes(r.status) });
            sleep(Math.random() * 5 + 5); // التلميذ راهو يتفرج (وقت طويل شوية)
        });
    }

    // 3. البحث في الـ Admin (1% برك من المستخدمين يمثلوا دور الأستاذ)
    if (Math.random() < 0.01) {
        group('Admin Action', function () {
            const res = http.get(`${BASE_URL}/api/admin/students?q=mohamed`, params);
            check(res, { 'Admin Search Handled': (r) => [200, 403, 404].includes(r.status) });
            sleep(2);
        });
    }
}
const fs = require('fs');
const path = require('path');

const basePath = 'c:/bacx/src/app';

const mappings = {
    // Authenticaton
    '(auth)/auth/signup/page.tsx': 'إنشاء حساب جديد',
    '(auth)/forgot-password/page.tsx': 'استعادة كلمة المرور',
    '(auth)/login/page.tsx': 'تسجيل الدخول',
    '(auth)/update-password/page.tsx': 'تحديث كلمة المرور',
    '(auth)/verify-otp/page.tsx': 'التحقق من الحساب',

    // Dashboard
    '(dashboard)/dashboard/page.tsx': 'لوحة المتابعة',
    '(dashboard)/materials/page.tsx': 'المواد الدراسية',
    '(dashboard)/materials/[subjectId]/page.tsx': 'محتوى المادة',
    '(dashboard)/live/page.tsx': 'البث المباشر',
    '(dashboard)/community/page.tsx': 'مجتمع الطلبة',
    '(dashboard)/profile/page.tsx': 'الملف الشخصي',
    '(dashboard)/settings/page.tsx': 'إعدادات الحساب',
    '(dashboard)/settings/edit-profile/page.tsx': 'تعديل الملف الشخصي',
    '(dashboard)/subscription/page.tsx': 'تفاصيل الاشتراك',
    '(dashboard)/checkout/[planId]/page.tsx': 'إتمام الدفع',
    '(dashboard)/checkout/buy/[type]/[id]/page.tsx': 'تأكيد الشراء',

    // Admin
    'admin/page.tsx': 'مركز القيادة',
    'admin/students/page.tsx': 'إدارة الطلبة',
    'admin/students/[id]/page.tsx': 'ملف الطالب',
    'admin/requests/page.tsx': 'طلبات التعديل',
    'admin/dashboard/financial/page.tsx': 'التقارير المالية',
    'admin/payments/page.tsx': 'إدارة المدفوعات',
    'admin/plans/page.tsx': 'خطط الاشتراك',
    'admin/offers/page.tsx': 'إدارة العروض',
    'admin/coupons/page.tsx': 'إدارة الكوبونات',
    'admin/content/page.tsx': 'إدارة المحتوى',
    'admin/live/page.tsx': 'إدارة البث المباشر',
    'admin/schedule/page.tsx': 'الجدول الدراسي',
    'admin/announcements/page.tsx': 'إدارة الإعلانات',
    'admin/logs/page.tsx': 'سجلات الأمان',
    'admin/security/devices/page.tsx': 'الأجهزة المتصلة',
    'admin/controls/page.tsx': 'إعدادات النظام',
    'admin/updates/page.tsx': 'تحديثات المنصة',
    '(dashboard)/admin/hero-management/page.tsx': 'إدارة واجهة المنصة',

    // Marketing & System
    'about/page.tsx': 'من نحن',
    'pricing/page.tsx': 'خطط الأسعار',
    'complete-profile/page.tsx': 'إكمال الملف الشخصي',
    'maintenance/page.tsx': 'الصيانة الدورية',
    'not-found.tsx': 'الصفحة غير موجودة',
};

const notFounds = [
    '(auth)/not-found.tsx',
    '(dashboard)/not-found.tsx',
    'admin/not-found.tsx'
];
for (const nf of notFounds) {
    if (fs.existsSync(path.join(basePath, nf))) {
        mappings[nf] = 'الصفحة غير موجودة';
    }
}

let clientErr = [];
let missing = [];

for (const [relPath, title] of Object.entries(mappings)) {
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) {
        missing.push(relPath);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.match(/["']use client["']/)) {
        // Can't set metadata in a client component!
        clientErr.push(relPath);
        continue;
    }

    // Inject or update
    if (content.match(/export const metadata/)) {
        // update existing
        content = content.replace(/title\s*:\s*(['"])(.*?)\1/, `title: "${title}"`);
        // if no title exists in metadata block
        if (!content.match(/title\s*:/) && content.includes('export const metadata')) {
            content = content.replace(/export const metadata([^{]+?)\{\s*/, `export const metadata$1{\n  title: "${title}",\n  `);
        }
    } else {
        // inject new
        let injectStr = `\nexport const metadata = {\n  title: "${title}",\n};\n\n`;
        // insert after imports
        const lastImportIndex = [...content.matchAll(/^import /gm)].slice(-1)[0]?.index;
        if (lastImportIndex !== undefined) {
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, nextLineIndex + 1) + injectStr + content.slice(nextLineIndex + 1);
        } else {
            content = injectStr + content;
        }
    }

    fs.writeFileSync(fullPath, content);
}

// Update Layout
const rootLayoutFile = path.join(basePath, 'layout.tsx');
let rootLayoutContent = fs.readFileSync(rootLayoutFile, 'utf8');
rootLayoutContent = rootLayoutContent.replace(/title:\s*\{[^}]*\},/s, `title: {\n    template: '%s | BRAINY',\n    default: 'BRAINY | منصة التفوق الأكاديمي',\n  },`);
fs.writeFileSync(rootLayoutFile, rootLayoutContent);

fs.writeFileSync(path.join(basePath, 'skipped.json'), JSON.stringify({ clientErr, missing }, null, 2));

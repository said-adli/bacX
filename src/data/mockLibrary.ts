export interface Lesson {
    id: string;
    title: string;
    duration: string;
    videoStart?: number; // Optional start time (for deep linking)
}

export interface Subject {
    id: string;
    name: string;
    icon: string; // Emoji for now, can be replaced with Lucide component names if needed
    unitCount: number;
    lessonCount: number;
    description: string;
    lessons: Lesson[];
    color: string; // Tailwind color class backbone (e.g. 'blue', 'purple')
}

// VIDEO ID NOTES:
// Ideally, these are encrypted IDs if using our EncodedPlayer logic.
// For now, we will use direct YouTube IDs as placeholders, but the player might need to support both or we upgrade the mock to return "encrypted" strings.
// To test the EncodedPlayer, we might need to actually mock the /api/video/decrypt endpoint or modify the player to accept plain IDs for 'dev' mode.
// UPDATE: User confirmed "Using EncodedVideoPlayer.tsx for ALL video content".
// We will assume the player expects a "salt+id+salt" string base64 encoded.
// For simplicity in this mock, we'll just store the raw YouTube ID and let the consumer or a mock-provider handle the "encoding" if strictly needed,
// OR we just assume these ARE the "encoded" strings for the sake of the UI.
// Let's use raw IDs for clarity, and if the player *fails* because of decryption, we'll adjust the player to have a 'dev-bypass' mode.

export const SUBJECTS: Subject[] = [
    {
        id: "math",
        name: "الرياضيات",
        icon: "📐",
        unitCount: 12,
        lessonCount: 45,
        description: "تحليل، جبر، وهندسة فضائية مع التركيز على حل المشكلات المعقدة.",
        color: "blue",
        lessons: [
            { id: "math-01", title: "مراجعة شاملة: الدوال الأسية", duration: "1:30:00" },
            { id: "math-02", title: "الأعداد العقدية: الجزء الأول", duration: "45:00" },
            { id: "math-03", title: "حساب الاحتمالات", duration: "1:15:00" },
            { id: "math-04", title: "المتتاليات العددية", duration: "0:55:00" },
            { id: "math-05", title: "التكامل وحساب المساحات", duration: "1:20:00" }
        ]
    },
    {
        id: "physics",
        name: "الفيزياء",
        icon: "⚡",
        unitCount: 8,
        lessonCount: 32,
        description: "الموجات، التحولات النووية، والكهرباء.",
        color: "purple",
        lessons: [
            { id: "phys-01", title: "الموجات الميكانيكية المتوالية", duration: "1:10:00" },
            { id: "phys-02", title: "التحولات النووية: التناقص الإشعاعي", duration: "1:45:00" },
            { id: "phys-03", title: "ثنائي القطب RC", duration: "1:00:00" },
            { id: "phys-04", title: "الميكانيك: قوانين نيوتن", duration: "2:00:00" }
        ]
    },
    {
        id: "chemistry",
        name: "الكيمياء",
        icon: "🧪",
        unitCount: 6,
        lessonCount: 28,
        description: "التحولات السريعة والبطيئة، وحالة توازن مجموعة كيميائية.",
        color: "green",
        lessons: [
            { id: "chem-01", title: "التحولات السريعة والتحولات البطيئة", duration: "0:50:00" },
            { id: "chem-02", title: "التحولات المقرونة بتفاعلات حمض-قاعدة", duration: "1:15:00" },
            { id: "chem-03", title: "تطور مجموعة كيميائية نحو حالة التوازن", duration: "1:30:00" }
        ]
    },
    {
        id: "philosophy",
        name: "الفلسفة",
        icon: "🤔",
        unitCount: 4,
        lessonCount: 20,
        description: "مجزوءة الوضع البشري، المعرفة، والسياسة.",
        color: "orange",
        lessons: [
            { id: "philo-01", title: "الشخص والهوية", duration: "0:45:00" },
            { id: "philo-02", title: "الغير: وجود الغير", duration: "1:00:00" },
            { id: "philo-03", title: "النظرية والتجربة", duration: "1:15:00" }
        ]
    },
    {
        id: "english",
        name: "اللغة الإنجليزية",
        icon: "🇬🇧",
        unitCount: 10,
        lessonCount: 40,
        description: "Grammar, Vocabulary, and Writing skills.",
        color: "red",
        lessons: [
            { id: "eng-01", title: "Tenses Review: Past Simple vs Continuous", duration: "0:40:00" },
            { id: "eng-02", title: "Writing: Argumentative Essay", duration: "1:00:00" },
            { id: "eng-03", title: "Vocabulary: Education & Youth", duration: "0:30:00" }
        ]
    },
    {
        id: "svt",
        name: "علوم الحياة والأرض",
        icon: "🧬",
        unitCount: 6,
        lessonCount: 24,
        description: "استهلاك المادة العضوية وتدفق الطاقة.",
        color: "emerald",
        lessons: [
            { id: "svt-01", title: "تحرير الطاقة الكامنة في المادة العضوية", duration: "1:20:00" },
            { id: "svt-02", title: "ألية تقلص العضلة الهيكلية", duration: "1:10:00" },
            { id: "svt-03", title: "الخبر الوراثي", duration: "1:30:00" }
        ]
    }
];

// MOCK VIDEO MAP
// Maps a Lesson ID to a playback ID.
// Using a generic landscape video for all for demo purposes.
export const DEMO_VIDEO_ID = "dQw4w9WgXcQ"; // Never gonna give you up... classic placeholder.
// Or a real educational one:
export const EDUCATIONAL_VIDEO_ID = "M7lc1UVf-VE"; // YouTube Developers

export function getLessonVideoId(lessonId: string): string {
    // Return a mock encoded string.
    // In reality, this would be the "salt+id+salt" base64 string.
    // For our 'fixed' player, we might just return the raw ID if we modify the player slightly,
    // OR we return a dummy string that strictly needs the decryption API.

    // For now, let's return a string that LOOKS like it might need decryption, 
    // but the player might need to be patched to handle "demo" mode if API is missing.
    export interface NewsItem {
        id: string;
        title: string;
        date: string;
        category: "دراسة" | "إعلان" | "تحديث";
    }

    export const NEWS: NewsItem[] = [
        { id: "1", title: "تم تحديث محتوى مادة الفيزياء - وحدة الكهرباء", date: "منذ 2 ساعة", category: "دراسة" },
        { id: "2", title: "موعد الاختبار التجريبي الأول يوم السبت", date: "منذ 5 ساعات", category: "إعلان" },
        { id: "3", title: "تعديل في توقيت الحصة المباشرة ليوم الغد", date: "أمس", category: "تحديث" },
        { id: "4", title: "نصائح للتحضير الجيد للامتحانات الوطنية", date: "أمس", category: "دراسة" },
    ];

    export interface Appointment {
        id: string;
        title: string;
        timestamp: string; // ISO Status
        type: "live" | "exam";
    }

    export const APPOINTMENTS: Appointment[] = [
        { id: "1", title: "حصة الرياضيات المباشرة", timestamp: "2026-03-10T20:00:00", type: "live" },
        { id: "2", title: "اختبار الفيزياء النووية", timestamp: "2026-03-15T15:00:00", type: "exam" },
    ];


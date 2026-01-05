import { use } from "react";
import LessonContent from "@/components/lesson/LessonContent";

const MOCK_LESSON = {
    title: "الدرس 1: الدوال الأسية وتطبيقاتها",
    description: "شرح معمق لمفهوم الدوال الأسية مع حل تمارين نموذجية من بكالوريات سابقة.",
    videoUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ"
};

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <main className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 lg:p-8">
            <LessonContent
                id={id}
                title={MOCK_LESSON.title}
                description={MOCK_LESSON.description}
                videoUrl={MOCK_LESSON.videoUrl}
            />
        </main>
    );
}

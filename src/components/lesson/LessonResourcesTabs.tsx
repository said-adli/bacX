import LessonNotes from "@/components/lesson/LessonNotes";

export default async function LessonResourcesTabs({ lessonId, isSubscribed }: { lessonId: string | undefined, isSubscribed?: boolean }) {
    if (!lessonId || !isSubscribed) return null;

    return (
        <div className="animate-in fade-in duration-700 delay-300">
            <LessonNotes lessonId={lessonId} />
        </div>
    );
}

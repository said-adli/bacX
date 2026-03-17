import { getSubjectHierarchy } from "@/actions/lesson";
import { Sidebar } from "@/components/lesson/Sidebar";

export default async function CourseCurriculumSidebar({ subjectId, activeLessonId }: { subjectId: string, activeLessonId?: string }) {
    const { subject, error } = await getSubjectHierarchy(subjectId);

    if (error || !subject) {
        return <div className="text-white/40 p-4">Subject list unavailable.</div>;
    }

    return (
        <Sidebar
            units={subject.units || []}
            activeLessonId={activeLessonId}
            subjectId={subjectId}
        />
    );
}

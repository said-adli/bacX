import { SubjectDTO } from "@/types/subject";
import { SubjectCards } from "./SubjectCards";
import { getDashboardSubjects } from "@/services/dashboard.service";

interface SubjectsGridProps {
    query?: string;
    userId: string;
}

export default async function SubjectsGrid({ query, userId }: SubjectsGridProps) {
    const subjects = await getDashboardSubjects(userId);

    // Filter by query if needed (though usually better done in DB/Service, doing it here for simple lists is fine)
    // The previous implementation passed query to Client Component SubjectCards which likely did filtering or highlighting.
    // We will continue passing subjects to SubjectCards.

    return <SubjectCards query={query} initialSubjects={subjects} />;
}

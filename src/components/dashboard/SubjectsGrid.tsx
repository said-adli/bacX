import { SubjectDTO } from "@/types/subject";
import { SubjectCards } from "./SubjectCards";

interface SubjectsGridProps {
    query?: string;
    subjects: SubjectDTO[];
}

export default function SubjectsGrid({ query, subjects }: SubjectsGridProps) {
    // Pass to Client Component
    // Casting DTO to any/Subject because SubjectCards expects a slightly looser/different type
    // but we know it works because specific fields are redundant or matched.
    return <SubjectCards query={query} initialSubjects={subjects} />;
}

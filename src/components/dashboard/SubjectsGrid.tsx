import { getSubjectsData } from "@/actions/dashboard";
import { SubjectCards } from "./SubjectCards";

export default async function SubjectsGrid({ query }: { query?: string }) {
    // Fetch data on server
    const subjects = await getSubjectsData();

    // Pass to Client Component
    return <SubjectCards query={query} initialSubjects={subjects} />;
}

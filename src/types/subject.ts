export interface SubjectDTO {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
    color: string | null;
    slug: string;
    published: boolean;
    // We include a minimal lesson structure because the UI currently uses it for search filtering.
    lessons: {
        id: string;
        title: string;
    }[];
    // Optional statistics for UI
    lessonCount?: number;
    unitCount?: number;

    // Optional because it might be merged later or not always fetched
    progress?: number;
}

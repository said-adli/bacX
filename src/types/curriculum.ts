/**
 * Curriculum DTOs - Strict types for Units, Lessons, and the nested Subject structure.
 * Used by Admin Content Tree and public curriculum views.
 */

export interface LessonDTO {
    id: string;
    title: string;
    unit_id: string;
    subject_id?: string;
    type: 'video' | 'live_stream' | 'pdf' | 'quiz';
    video_url?: string | null;
    required_plan_id?: string | null;
    is_free?: boolean;
    duration?: string | null;
    order_index?: number;
    created_at?: string;
    is_purchasable?: boolean;
    price?: number | null;
    scheduled_at?: string | number | Date;
}

export interface UnitDTO {
    id: string;
    title: string;
    subject_id: string;
    order_index?: number;
    lessons?: LessonDTO[];
}

/**
 * Full Subject with Units+Lessons.
 * For Admin Content Tree and detailed curriculum pages.
 */
export interface SubjectWithUnitsDTO {
    id: string;
    name: string;
    slug?: string;
    icon?: string | null;
    description?: string | null;
    is_active?: boolean;
    order_index?: number;
    units?: UnitDTO[];
}

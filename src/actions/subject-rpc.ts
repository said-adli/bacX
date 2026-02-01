"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateSubjects } from "@/lib/cache/revalidate";

// ============================================
// TYPES
// ============================================
type OperationType = 'create' | 'update';

interface ManageSubjectParams {
    name: string;
    icon?: string;
    operationType: OperationType;
    subjectId?: string;
    order?: number;
}

interface ManageSubjectResult {
    success: boolean;
    subjectId?: string;
    error?: string;
}

// ============================================
// SERVER ACTION: manageSubjectRPC
// Uses database-level stored function for atomic operations
// ============================================
export async function manageSubjectRPC(
    params: ManageSubjectParams
): Promise<ManageSubjectResult> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.rpc('manage_subject', {
            p_name: params.name,
            p_icon: params.icon ?? 'Folder',
            p_operation_type: params.operationType,
            p_subject_id: params.subjectId ?? null,
            p_order: params.order ?? 0,
        });

        if (error) {
            console.error('[manageSubjectRPC] RPC Error:', error);

            // Parse PostgreSQL error messages for user-friendly responses
            if (error.message.includes('Access Denied')) {
                return { success: false, error: 'ليس لديك صلاحية لإدارة المواد.' };
            }
            if (error.message.includes('Duplicate Error')) {
                return { success: false, error: 'يوجد مادة بهذا الاسم بالفعل.' };
            }
            if (error.message.includes('Not Found')) {
                return { success: false, error: 'المادة غير موجودة.' };
            }

            return { success: false, error: 'حدث خطأ غير متوقع. حاول مرة أخرى.' };
        }

        // Revalidate cached data
        revalidateSubjects();
        revalidatePath('/dashboard');
        revalidatePath('/admin/content');

        return {
            success: true,
            subjectId: data as string,
        };
    } catch (err) {
        console.error('[manageSubjectRPC] Unexpected Error:', err);
        return { success: false, error: 'حدث خطأ في الاتصال بالخادم.' };
    }
}

// ============================================
// CONVENIENCE WRAPPERS
// ============================================
export async function createSubjectRPC(
    name: string,
    icon: string = 'Folder',
    order: number = 0
): Promise<ManageSubjectResult> {
    return manageSubjectRPC({
        name,
        icon,
        operationType: 'create',
        order,
    });
}

export async function updateSubjectRPC(
    subjectId: string,
    name: string,
    icon: string = 'Folder',
    order: number = 0
): Promise<ManageSubjectResult> {
    return manageSubjectRPC({
        name,
        icon,
        operationType: 'update',
        subjectId,
        order,
    });
}

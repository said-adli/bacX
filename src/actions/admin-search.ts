"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";

export type SearchResult = {
    id: string;
    title: string;
    subtitle: string;
    type: 'student' | 'coupon' | 'subject';
    href: string;
    meta?: Record<string, unknown>;
}

export type GroupedResults = {
    students: SearchResult[];
    coupons: SearchResult[];
    subjects: SearchResult[];
}

const MAX_QUERY_LENGTH = 100;

function sanitizeSearchQuery(query: string): string {
    // Enhanced sanitization: allow Unicode letters/numbers, spaces, dots, dashes, at-signs.
    // Remove potential SQL injection chars like quotes, semicolons, percentages.
    return query
        .trim()
        .replace(/[^\p{L}\p{N}@._\-\s]/gu, "")
        .slice(0, MAX_QUERY_LENGTH);
}

export async function globalSearch(query: string): Promise<GroupedResults> {
    if (!query || query.length < 2) {
        return { students: [], coupons: [], subjects: [] };
    }

    // 1. Verify Admin
    await requireAdmin();

    // 2. Parallel Search (Using Admin Client to guarantee visibility)
    const adminClient = createAdminClient();
    const sanitizedQuery = sanitizeSearchQuery(query);

    if (!sanitizedQuery) return { students: [], coupons: [], subjects: [] };

    const [studentsResult, couponsResult, subjectsResult] = await Promise.all([
        // Search Students
        // Using AdminClient with filtered text to avoid full raw string injection risk in 'or'
        // Ideally this should use an RPC 'admin_search_students' if available.
        adminClient
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'student')
            .or(`full_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`)
            .limit(5),

        // Search Coupons
        adminClient
            .from('coupons')
            .select('id, code, discount_amount, discount_type')
            .ilike('code', `%${sanitizedQuery}%`)
            .limit(5),

        // Search Subjects
        adminClient
            .from('subjects')
            .select('id, name')
            .ilike('name', `%${sanitizedQuery}%`)
            .limit(5)
    ]);

    // 3. Transform Results
    interface RawStudent { id: string; full_name: string | null; email: string }
    interface RawCoupon { id: string; code: string; discount_amount: number; discount_type: string }
    interface RawSubject { id: string; name: string }

    const students: SearchResult[] = ((studentsResult.data || []) as RawStudent[]).map((s) => ({
        id: s.id,
        title: s.full_name || "Unknown Student",
        subtitle: s.email,
        type: 'student' as const,
        href: `/admin/students/${s.id}`
    }));

    const coupons: SearchResult[] = ((couponsResult.data || []) as RawCoupon[]).map((c) => ({
        id: c.id,
        title: c.code,
        subtitle: `${c.discount_amount}${c.discount_type === 'percentage' ? '%' : ' DA'}`,
        type: 'coupon' as const,
        href: `/admin/coupons?highlight=${c.id}`
    }));

    const subjects: SearchResult[] = ((subjectsResult.data || []) as RawSubject[]).map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: "Subject Context",
        type: 'subject' as const,
        href: `/admin/content?subjectId=${s.id}` // Assuming this route exists
    }));

    return { students, coupons, subjects };
}

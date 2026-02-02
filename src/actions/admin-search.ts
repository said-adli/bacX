"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export type SearchResult = {
    id: string;
    title: string;
    subtitle: string;
    type: 'student' | 'coupon' | 'subject';
    href: string;
    meta?: any;
}

export type GroupedResults = {
    students: SearchResult[];
    coupons: SearchResult[];
    subjects: SearchResult[];
}

export async function globalSearch(query: string): Promise<GroupedResults> {
    if (!query || query.length < 2) {
        return { students: [], coupons: [], subjects: [] };
    }

    const supabase = await createClient();

    // 1. Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { students: [], coupons: [], subjects: [] };

    // We can skip explicit role check for search read-only if we rely on RLS, 
    // but strict is better.
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { students: [], coupons: [], subjects: [] };

    // 2. Parallel Search (Using Admin Client to guarantee visibility)
    const adminClient = createAdminClient();
    const sanitizedQuery = query.toLowerCase();

    const [studentsResult, couponsResult, subjectsResult] = await Promise.all([
        // Search Students
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
    const students: SearchResult[] = (studentsResult.data || []).map((s: any) => ({
        id: s.id,
        title: s.full_name || "Unknown Student",
        subtitle: s.email,
        type: 'student',
        href: `/admin/students/${s.id}`
    }));

    const coupons: SearchResult[] = (couponsResult.data || []).map((c: any) => ({
        id: c.id,
        title: c.code,
        subtitle: `${c.discount_amount}${c.discount_type === 'percentage' ? '%' : ' DA'}`,
        type: 'coupon',
        href: `/admin/coupons?highlight=${c.id}`
    }));

    const subjects: SearchResult[] = (subjectsResult.data || []).map((s: any) => ({
        id: s.id,
        title: s.name,
        subtitle: "Subject Context",
        type: 'subject',
        href: `/admin/content?subjectId=${s.id}` // Assuming this route exists
    }));

    return { students, coupons, subjects };
}

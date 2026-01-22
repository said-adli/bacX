// Force TS Update
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import SubjectView from "./SubjectViewComp";

interface PageProps {
    params: Promise<{ subjectId: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
    const { subjectId } = await params;
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect("/login");
    }

    // 2. Fetch User Profile with Plan
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_subscribed, active_plan_id')
        .eq('id', user.id)
        .single();

    if (!profile) redirect("/login");

    const isAdmin = profile.role === 'admin';

    // 3. Fetch Subject
    const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

    if (subjectError || !subject) {
        return notFound();
    }

    // 4. Fetch Units (Public)
    const { data: units } = await supabase
        .from('units')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at');

    let unitsWithLessons = [];

    if (units && units.length > 0) {
        // Fetch ALL lessons (we will filter/sanitize in memory for complex permission logic)
        // Note: Ideally, we use complex RLS or a View, but for granular 'plan' check, 
        // JS logic is often easier unless we join tables in RLS.
        const { data: allLessons } = await supabase
            .from('lessons')
            .select('*')
            .in('unit_id', units.map(u => u.id))
            .order('created_at');

        unitsWithLessons = units.map(unit => {
            const unitLessons = allLessons?.filter(l => l.unit_id === unit.id) || [];

            return {
                ...unit,
                lessons: unitLessons.map(lesson => {
                    // Start with full access assumption for admin
                    let hasAccess = isAdmin;

                    if (!isAdmin) {
                        // Check if lesson requires a plan
                        if (lesson.required_plan_id) {
                            // Must correspond to user's active plan
                            hasAccess = profile.active_plan_id === lesson.required_plan_id;
                        } else {
                            // If no specific plan required, fallback to general subscription or free
                            // Assuming 'is_free' flag exists or default to subscribed
                            // If user is just 'subscribed' (legacy) and lesson has NO plan requirement, do they get access?
                            // Yes, if is_subscribed is true.
                            // Or if lesson is explicitly free (legacy field).
                            // Let's assume: is_free OR (is_subscribed AND !required_plan_id)
                            hasAccess = !!lesson.is_free || !!profile.is_subscribed;
                        }
                    }

                    // Sanitize if no access
                    if (hasAccess) {
                        return lesson;
                    } else {
                        return {
                            ...lesson,
                            video_url: null, // REDACTED
                            youtube_id: null,
                            pdf_url: null,    // REDACTED
                            is_locked: true   // UI Flag
                        };
                    }
                })
            };
        });
    }

    // Also fetch legacy lessons (direct subject_id, no unit) for backward compatibility?
    // User requested "Subject -> Unit -> Content". We can assume legacy is deprecated or handle it as "General Unit".
    // For now, let's stick to Units.

    return (
        <SubjectView
            subject={subject}
            units={unitsWithLessons}
            isSubscribed={profile.is_subscribed || isAdmin} // General UI state, specific locks handled in lesson data
        />
    );
}

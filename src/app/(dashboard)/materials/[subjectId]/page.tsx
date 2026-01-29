// Force TS Update
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SubjectView from "./SubjectViewComp";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ subjectId: string }>;
}

export default async function SubjectPage({ params }: PageProps) {
    const { subjectId } = await params;

    // 0. ID Validation (DISABLED FOR DEBUGGING)
    // const idRegex = /^[a-zA-Z0-9-_]+$/;
    // if (!idRegex.test(subjectId)) {
    //      return ( ... ); 
    // }

    // DEBUG: Pass everything through
    console.log("DEBUG: Subject ID received:", subjectId);

    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        // redirect("/login"); // DISABLED FOR DEBUG
        return (
            <div className="p-10 bg-red-900 text-white border-2 border-red-500 m-10 rounded text-xl">
                <h1>🚨 DEBUG MODE: AUTH FAILED</h1>
                <p>User is not logged in.</p>
                <p>Auth Error: {authError?.message}</p>
            </div>
        );
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
    // 3. Fetch Subject (Defensive)
    let subject = null;
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', subjectId)
            .single();

        if (error) throw error;
        subject = data;
    } catch (err: any) {
        console.error("Subject Fetch Critical Error:", err);
        return (
            <div className="p-10 bg-red-900 text-white border-2 border-red-500 m-10 rounded text-xl" style={{ direction: 'ltr' }}>
                <h1>🚨 DEBUG MODE</h1>
                <p>The redirect was stopped manually.</p>
                <p>Error Message: {err?.message || "Unknown Error"}</p>
                <p>Subject ID received: {subjectId}</p>
                <pre className="mt-4 text-sm bg-black p-4 rounded">{JSON.stringify(err, null, 2)}</pre>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <GlassCard className="p-8 text-center max-w-md border-yellow-500/20">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">المادة غير متوفرة</h2>
                    <p className="text-white/60 mb-6">
                        لم يتم العثور على المادة "Subject ID: {subjectId}". قد تكون حذفت أو غير متاحة.
                    </p>
                    <Link
                        href="/materials"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg transition-colors border border-yellow-500/20"
                    >
                        <ArrowLeft size={16} />
                        العودة للمواد
                    </Link>
                </GlassCard>
            </div>
        );
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

    return (
        <SubjectView
            subject={subject}
            units={unitsWithLessons}
            isSubscribed={profile.is_subscribed || isAdmin} // General UI state, specific locks handled in lesson data
        />
    );
}

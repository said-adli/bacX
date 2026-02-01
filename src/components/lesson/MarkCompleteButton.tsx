"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { toggleLessonCompletion } from "@/lib/actions/progress";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface MarkCompleteButtonProps {
    lessonId: string;
    className?: string;
}

export default function MarkCompleteButton({ lessonId, className }: MarkCompleteButtonProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Fetch initial state
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data } = await supabase
                    .from("student_progress")
                    .select("is_completed")
                    .eq("user_id", user.id)
                    .eq("lesson_id", lessonId)
                    .single();

                if (data) setIsCompleted(data.is_completed);
            } catch (e) {
                console.error("Failed to fetch progress", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProgress();
    }, [lessonId]);

    const handleToggle = () => {
        const newValue = !isCompleted;
        // Optimistic Update
        setIsCompleted(newValue);

        startTransition(async () => {
            const result = await toggleLessonCompletion(lessonId, newValue);
            if (result.error) {
                // Revert on failure
                setIsCompleted(!newValue);
                console.error("Toggle failed:", result.error);
            }
        });
    };

    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50", className)}>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "flex items-center gap-3 px-5 py-3 rounded-xl font-bold transition-all duration-300 border",
                isCompleted
                    ? "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white",
                isPending && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
            ) : (
                <Circle className="w-5 h-5" />
            )}
            <span className="text-sm">
                {isCompleted ? "Completed ✓" : "Mark as Complete"}
            </span>
        </button>
    );
}

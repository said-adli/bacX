"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FileText, Save, Loader2, CheckCircle } from "lucide-react";
import { saveNote, getNote } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";

interface LessonNotesProps {
    lessonId: string;
    className?: string;
}

export default function LessonNotes({ lessonId, className }: LessonNotesProps) {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch existing note on mount
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const result = await getNote(lessonId);
                if (result.data?.content) {
                    setContent(result.data.content);
                }
            } catch (e) {
                console.error("Failed to load note", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNote();
    }, [lessonId]);

    // Debounced Save (1 second after typing stops)
    const debouncedSave = useCallback((newContent: string) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                const result = await saveNote(lessonId, newContent);
                if (!result.error) {
                    setLastSaved(new Date());
                }
            } catch (e) {
                console.error("Save failed", e);
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    }, [lessonId]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        debouncedSave(newContent);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    if (isLoading) {
        return (
            <div className={cn("flex items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/10", className)}>
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={cn("bg-white/5 rounded-2xl border border-white/10 overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
                <div className="flex items-center gap-2 text-white/60">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">My Notes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                    {isSaving ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : lastSaved ? (
                        <>
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Saved</span>
                        </>
                    ) : (
                        <span>Auto-save enabled</span>
                    )}
                </div>
            </div>

            {/* Textarea */}
            <textarea
                value={content}
                onChange={handleChange}
                placeholder="Write your notes here... They will be saved automatically."
                className="w-full h-64 p-4 bg-transparent text-white/90 resize-none focus:outline-none placeholder:text-white/20 text-sm leading-relaxed"
            />
        </div>
    );
}

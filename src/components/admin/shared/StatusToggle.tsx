"use client";

import { useOptimistic, startTransition } from "react";
import { toggleStatus } from "@/actions/admin-generic";
import { Switch } from "@/components/ui/Switch"; // Assuming Shadcn/Radix switch exists, or we build a simple one
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
    table: string;
    id: string;
    field: string;
    initialValue: boolean;
    className?: string;
}

export function StatusToggle({ table, id, field, initialValue, className }: StatusToggleProps) {
    const [optimisticValue, setOptimisticValue] = useOptimistic(
        initialValue,
        (state, newValue: boolean) => newValue
    );

    const handleToggle = (checked: boolean) => {
        // 1. Optimistic Update (Immediate Visual Change)
        startTransition(() => {
            setOptimisticValue(checked);
        });

        // 2. Server Action (Background)
        toggleStatus(table, id, field, checked)
            .then(() => {
                // Success - UI matches Server (via Revalidate or just stays optimistic)
            })
            .catch((err) => {
                // Failure - Revert Optimistic? 
                // useOptimistic automatically resets if we trigger a re-render with old props, 
                // but usually we just toast and maybe manually revert if we had local state.
                // With useOptimistic, the state is derived from prop + pending action.
                // If action executes and fails, we might need to manually force a refresh or tell user.
                toast.error("Failed to update status");
                startTransition(() => {
                    setOptimisticValue(!checked); // Visual Revert
                });
            });
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Switch
                checked={optimisticValue}
                onCheckedChange={handleToggle}
                className={cn(
                    "data-[state=checked]:bg-emerald-500",
                    "data-[state=unchecked]:bg-zinc-700"
                )}
            />
            <span className={cn("text-xs font-mono font-bold", optimisticValue ? "text-emerald-500" : "text-zinc-500")}>
                {optimisticValue ? "ACTIVE" : "HIDDEN"}
            </span>
        </div>
    );
}

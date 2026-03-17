"use client";

import { useOptimistic, startTransition } from "react";
import { toggleStatusAction } from "@/actions/toggle";
import { Switch } from "@/components/ui/Switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

interface StatusToggleProps {
    table: "subjects" | "coupons" | "profiles";
    id: string;
    field: string;
    initialValue: boolean;
    className?: string;
    labelActive?: string;
    labelInactive?: string;
}

export function StatusToggle({
    table,
    id,
    field,
    initialValue,
    className,
    labelActive = "ACTIVE",
    labelInactive = "HIDDEN"
}: StatusToggleProps) {
    const router = useRouter();
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
        toggleStatusAction(table, id, field, checked)
            .then(() => {
                router.refresh();
            })
            .catch((err) => {
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
            />
            <span className={cn("text-xs font-mono font-bold w-12", optimisticValue ? "text-blue-500" : "text-zinc-500")}>
                {optimisticValue ? labelActive : labelInactive}
            </span>
        </div>
    );
}

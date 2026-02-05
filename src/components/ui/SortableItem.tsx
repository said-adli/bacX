"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSortable, UseSortableArguments } from "@dnd-kit/sortable";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface SortableItemContextProps {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
    isDragging: boolean;
    dragHandleProps: Record<string, unknown>; // Combined attributes + listeners
}

const SortableItemContext = createContext<SortableItemContextProps | undefined>(undefined);

export function useSortableItem() {
    return useContext(SortableItemContext);
}

// Helper to make a specific element the drag handle
export function DragHandle({ children, className }: { children: React.ReactNode; className?: string }) {
    const context = useSortableItem();
    if (!context) return <>{children}</>;

    return (
        <div {...context.dragHandleProps} className={cn("cursor-grab active:cursor-grabbing touch-none", className)}>
            {children}
        </div>
    );
}

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export function SortableItem({ id, children, className, as: Component = "div" }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 999 : 'auto',
    };

    const contextValue = useMemo(() => ({
        attributes,
        listeners,
        isDragging,
        dragHandleProps: { ...attributes, ...listeners }
    }), [attributes, listeners, isDragging]);

    return (
        <SortableItemContext.Provider value={contextValue}>
            <Component ref={setNodeRef} style={style} className={className}>
                {children}
            </Component>
        </SortableItemContext.Provider>
    );
}

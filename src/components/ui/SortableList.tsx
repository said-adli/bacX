"use client";

import React, { useMemo } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    SortingStrategy,
} from "@dnd-kit/sortable";

interface SortableListProps<T extends { id: string }> {
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    strategy?: SortingStrategy;
    className?: string;
}

export function SortableList<T extends { id: string }>({
    items,
    onReorder,
    renderItem,
    strategy = verticalListSortingStrategy,
    className
}: SortableListProps<T>) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags on clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            onReorder(newItems);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((item) => item.id)}
                strategy={strategy}
            >
                <div className={className}>
                    {items.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {renderItem(item, index)}
                        </React.Fragment>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

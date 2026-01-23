"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CrystalSubjectCard } from "@/components/dashboard/CrystalSubjectCard";

// Grid config
const COLUMN_COUNT = 2; // Assuming md:grid-cols-2
const ROW_HEIGHT = 300; // Approx height of card + gap

export function VirtualizedSubjectGrid({ subjects }: { subjects: any[] }) {
    const parentRef = useRef<HTMLDivElement>(null);

    // Calculate row count
    const rowCount = Math.ceil(subjects.length / COLUMN_COUNT);

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ROW_HEIGHT,
        overscan: 5,
    });

    return (
        <div
            ref={parentRef}
            className="h-[800px] overflow-y-auto custom-scrollbar pr-2" // Fixed height window for virtualization
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
                    const startIndex = virtualRow.index * COLUMN_COUNT;
                    const rowSubjects = subjects.slice(startIndex, startIndex + COLUMN_COUNT);

                    return (
                        <div
                            key={virtualRow.index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6"
                        >
                            {rowSubjects.map((subject) => (
                                <CrystalSubjectCard
                                    key={subject.id}
                                    subject={subject}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

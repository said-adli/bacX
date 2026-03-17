"use client";

import dynamic from "next/dynamic";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

const MasterclassSection = dynamic(
    () => import("@/components/home/MasterclassSection").then((mod) => mod.MasterclassSection),
    {
        ssr: false,
        loading: () => <SectionSkeleton />
    }
);

export function MasterclassLoader() {
    return <MasterclassSection />;
}

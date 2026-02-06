"use client";

import { useSyncExternalStore } from "react";

export function usePageVisibility() {
    return useSyncExternalStore(
        (callback) => {
            document.addEventListener("visibilitychange", callback);
            return () => document.removeEventListener("visibilitychange", callback);
        },
        () => document.visibilityState === "visible",
        () => true // Server assumes visible
    );
}

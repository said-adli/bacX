/**
 * Cache Revalidation Utilities for BacX LMS
 * 
 * Central location for all cache invalidation logic.
 * Call these functions after admin mutations to ensure
 * users see fresh data immediately.
 * 
 * NOTE: Next.js 16 requires a cacheLife profile as second argument.
 * Using 'max' for immediate revalidation with SWR behavior.
 */

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cached-data";

// ============================================================================
// REVALIDATION FUNCTIONS
// ============================================================================

/**
 * Revalidate ALL content caches.
 * Use this after bulk operations or when unsure which cache to purge.
 */
export function revalidateAllContent(): void {
    revalidateTag(CACHE_TAGS.SUBJECTS, "max");
    revalidateTag(CACHE_TAGS.LESSONS, "max");
    revalidateTag(CACHE_TAGS.CURRICULUM, "max");
    revalidateTag(CACHE_TAGS.ANNOUNCEMENTS, "max");
}

/**
 * Revalidate subject-related caches.
 * Call after creating, updating, or deleting a subject.
 */
export function revalidateSubjects(): void {
    revalidateTag(CACHE_TAGS.SUBJECTS, "max");
    revalidateTag(CACHE_TAGS.CURRICULUM, "max");
}

/**
 * Revalidate lesson caches.
 * @param subjectId - Optional: Only revalidate lessons for this subject.
 */
export function revalidateLessons(subjectId?: string): void {
    revalidateTag(CACHE_TAGS.LESSONS, "max");
    revalidateTag(CACHE_TAGS.CURRICULUM, "max");

    if (subjectId) {
        revalidateTag(`lessons:${subjectId}`, "max");
    }
}

/**
 * Revalidate announcement cache.
 * Call after creating, updating, or deleting announcements.
 */
export function revalidateAnnouncements(): void {
    revalidateTag(CACHE_TAGS.ANNOUNCEMENTS, "max");
}

/**
 * Revalidate curriculum structure cache.
 * Call when the navigation structure changes.
 */
export function revalidateCurriculum(): void {
    revalidateTag(CACHE_TAGS.CURRICULUM, "max");
}

/**
 * Revalidate plans/offers cache.
 * Call after creating, updating, or deleting subscription plans.
 */
export function revalidatePlans(): void {
    revalidateTag(CACHE_TAGS.PLANS, "max");
}

/**
 * Revalidate users cache.
 * Call after banning/unbanning users.
 */
export function revalidateUsers(): void {
    revalidateTag(CACHE_TAGS.USERS, "max");
}

/**
 * Revalidate platform updates cache.
 * Call after creating, updating, or deleting changelog entries.
 */
export function revalidatePlatformUpdates(): void {
    revalidateTag(CACHE_TAGS.PLATFORM_UPDATES, "max");
}

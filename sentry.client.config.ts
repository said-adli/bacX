/**
 * Sentry Configuration for Next.js
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Capture 10% of transactions in production
    profilesSampleRate: 0.1,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Only enable in production or when DSN is set
    enabled: !!SENTRY_DSN,

    // Ignore common non-errors
    ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        /Loading chunk \d+ failed/,
        'Network request failed',
        'Load failed',
    ],

    // Before sending, filter sensitive data
    beforeSend(event) {
        // Remove sensitive cookies
        if (event.request?.cookies) {
            delete event.request.cookies.bacx_session;
            delete event.request.cookies.bacx_auth;
        }

        // Remove user PII except uid
        if (event.user) {
            event.user = {
                id: event.user.id,
                // Remove email, name, etc.
            };
        }

        return event;
    },
});

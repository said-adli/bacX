/**
 * Global Logger Utility
 * 
 * In production, swallows errors or formats them silently to avoid leaking
 * stack traces or sensitive variable states to the client console.
 * In development, provides standard verbose output.
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
    error: (message: string, error?: any) => {
        if (!isProd) {
            console.error(`[ERROR] ${message}`, error);
            return;
        }

        // In production, log a generalized message
        // Integrations like Sentry or Datadog should hook in here instead of console.error
        console.error(`[ERROR] ${message} (Details omitted for security in production)`);
    },
    warn: (message: string, data?: any) => {
        if (!isProd) {
            console.warn(`[WARN] ${message}`, data);
        }
    },
    info: (message: string, data?: any) => {
        if (!isProd) {
            console.info(`[INFO] ${message}`, data);
        }
    }
};

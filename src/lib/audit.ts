/**
 * Audit Logging Utility
 * Logs admin actions to audit_logs collection for compliance and forensics
 */

import * as admin from 'firebase-admin';

// Initialize admin if not already done
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.error("Firebase Admin init error in audit.ts:", e);
    }
}

interface AuditEntry {
    action: string;
    actorId: string;
    actorEmail?: string;
    targetId?: string;
    targetType?: string;
    details?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
}

/**
 * Log an admin action to the audit_logs collection
 */
export async function logAdminAction(entry: AuditEntry): Promise<string | null> {
    try {
        const db = admin.firestore();
        const auditRef = db.collection('audit_logs');

        const doc = await auditRef.add({
            ...entry,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            environment: process.env.NODE_ENV || 'development'
        });

        // console.log(`[AUDIT] ${entry.action} by ${entry.actorId} on ${entry.targetType}/${entry.targetId}`);
        return doc.id;
    } catch (error) {
        console.error('[AUDIT] Failed to log action:', error);
        return null;
    }
}

/**
 * Log a critical system error
 */
export async function logCriticalError(
    error: Error | string,
    context: Record<string, unknown> = {}
): Promise<void> {
    try {
        const db = admin.firestore();
        const errorsRef = db.collection('system_errors');

        await errorsRef.add({
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : null,
            context,
            severity: 'critical',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (logError) {
        console.error('[CRITICAL] Failed to log error:', logError);
    }
}

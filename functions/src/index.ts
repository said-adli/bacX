
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// ============================================================================
// HELPER: App Check Verification (Fail-Closed)
// ============================================================================
// ============================================================================
// HELPER: App Check Verification (Fail-Closed)
// ============================================================================
interface CallableContext {
    app?: {
        appId: string;
        token: admin.appCheck.DecodedAppCheckToken;
        alreadyConsumed?: boolean;
    };
    auth?: {
        uid: string;
        token: admin.auth.DecodedIdToken;
    };
    instanceIdToken?: string;
    rawRequest?: unknown;
}

function verifyAppCheck(context: CallableContext): void {
    // In production, context.app will be set if App Check token is valid
    // Fail-closed: deny if not present
    if (process.env.NODE_ENV === 'production' && !context.app) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'App Check verification failed. Request denied.'
        );
    }
}

// ============================================================================
// HELPER: Audit Logging
// ============================================================================
async function logAuditAction(
    db: admin.firestore.Firestore,
    action: string,
    actorId: string,
    targetId?: string,
    details?: Record<string, unknown>
): Promise<void> {
    try {
        await db.collection('audit_logs').add({
            action,
            actorId,
            targetId,
            details,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('[AUDIT] Failed to log:', error);
    }
}

// ============================================================================
// APPROVE PAYMENT - Sets subscriptionEnd instead of isSubscribed
// ============================================================================
// APPROVE PAYMENT - Sets subscriptionEnd instead of isSubscribed
// ============================================================================
interface ApprovePaymentData {
    paymentId: string;
    userId: string;
    durationDays?: number;
}

export const approvePayment = functions.https.onCall(async (data: ApprovePaymentData, context: CallableContext) => {
    verifyAppCheck(context);

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { paymentId, userId, durationDays = 30 } = data;
    if (!paymentId || !userId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing paymentId or userId.');
    }

    const db = admin.firestore();

    // Verify caller is admin
    const callerRef = db.collection('users').doc(context.auth.uid);
    const callerSnap = await callerRef.get();
    const callerData = callerSnap.data();

    if (!callerSnap.exists || callerData?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can approve payments.');
    }

    try {
        await db.runTransaction(async (t) => {
            const paymentRef = db.collection('payments').doc(paymentId);
            const userRef = db.collection('users').doc(userId);

            const paymentDoc = await t.get(paymentRef);
            if (!paymentDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Payment document not found.');
            }

            // Calculate subscription end date
            const subscriptionEnd = new Date();
            subscriptionEnd.setDate(subscriptionEnd.getDate() + durationDays);

            // Update payment status
            t.update(paymentRef, {
                status: 'approved',
                approvedAt: admin.firestore.FieldValue.serverTimestamp(),
                approvedBy: context.auth!.uid
            });

            // Update user subscription with EXPIRY DATE
            t.update(userRef, {
                isSubscribed: true, // Keep for backward compat
                subscriptionEnd: admin.firestore.Timestamp.fromDate(subscriptionEnd),
                subscriptionStart: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        // Audit log
        await logAuditAction(db, 'APPROVE_PAYMENT', context.auth.uid, userId, { paymentId, durationDays });

        return { success: true, message: 'Payment approved and user subscribed.' };
    } catch (error) {
        console.error("Transaction failure:", error);
        throw new functions.https.HttpsError('internal', 'Transaction failed: ' + (error as Error).message);
    }
});

// ============================================================================
// REJECT PAYMENT
// ============================================================================
interface RejectPaymentData {
    paymentId: string;
    reason?: string;
}

export const rejectPayment = functions.https.onCall(async (data: RejectPaymentData, context: CallableContext) => {
    verifyAppCheck(context);

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { paymentId, reason } = data;
    if (!paymentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing paymentId.');
    }

    const db = admin.firestore();

    // Verify caller is admin
    const callerRef = db.collection('users').doc(context.auth.uid);
    const callerSnap = await callerRef.get();
    const callerData = callerSnap.data();

    if (!callerSnap.exists || callerData?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can reject payments.');
    }

    try {
        await db.runTransaction(async (t) => {
            const paymentRef = db.collection('payments').doc(paymentId);
            const paymentDoc = await t.get(paymentRef);

            if (!paymentDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'Payment document not found.');
            }

            t.update(paymentRef, {
                status: 'rejected',
                rejectionReason: reason || 'No reason provided',
                rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
                rejectedBy: context.auth!.uid
            });
        });

        // Audit log
        await logAuditAction(db, 'REJECT_PAYMENT', context.auth.uid, paymentId, { reason });

        return { success: true, message: 'Payment rejected.' };
    } catch (error) {
        console.error("Transaction failure:", error);
        throw new functions.https.HttpsError('internal', 'Transaction failed: ' + (error as Error).message);
    }
});

// ============================================================================
// REGISTER DEVICE - Server-side enforcement with strict limit
// ============================================================================
// ============================================================================
// REGISTER DEVICE - Server-side enforcement with strict limit
// ============================================================================
interface DeviceData {
    deviceId: string;
    deviceName: string;
}


export const registerDevice = functions.https.onCall(async (data: DeviceData, context: CallableContext) => {
    verifyAppCheck(context);

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { deviceId, deviceName } = data;
    if (!deviceId || !deviceName) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing deviceId or deviceName.');
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(context.auth.uid);
    const MAX_DEVICES = 2;

    try {
        const result = await db.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            if (!userSnap.exists) {
                throw new functions.https.HttpsError('not-found', 'User profile not found.');
            }

            const userData = userSnap.data();
            const currentDevices: DeviceData[] = (userData?.activeDevices as DeviceData[]) || [];

            // Check if device already exists
            const existingIndex = currentDevices.findIndex((d: DeviceData) => d.deviceId === deviceId);
            if (existingIndex !== -1) {
                // Update last seen
                currentDevices[existingIndex].lastSeen = new Date().toISOString();
                t.update(userRef, { activeDevices: currentDevices });
                return { success: true, message: 'Device already registered.', isExisting: true };
            }

            // STRICT LIMIT CHECK - Server enforced
            if (currentDevices.length >= MAX_DEVICES && userData?.role !== 'admin') {
                throw new functions.https.HttpsError(
                    'resource-exhausted',
                    `Device limit (${MAX_DEVICES}) reached. Please remove a device first.`
                );
            }

            // Add new device
            const newDevice = {
                deviceId,
                deviceName,
                registeredAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            };

            t.update(userRef, {
                activeDevices: admin.firestore.FieldValue.arrayUnion(newDevice)
            });

            return { success: true, message: 'Device registered successfully.', isExisting: false };
        });

        return result;

    } catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error("Device registration error:", error);
        throw new functions.https.HttpsError('internal', 'Failed to register device.');
    }
});

// ============================================================================
// UNREGISTER DEVICE - Called on logout
// ============================================================================
export const unregisterDevice = functions.https.onCall(async (data: DeviceData, context: CallableContext) => {
    verifyAppCheck(context);

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { deviceId } = data;
    if (!deviceId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing deviceId.');
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(context.auth.uid);

    try {
        await db.runTransaction(async (t) => {
            const userSnap = await t.get(userRef);
            if (!userSnap.exists) {
                return; // User doesn't exist, nothing to do
            }

            const userData = userSnap.data();
            const currentDevices: DeviceData[] = (userData?.activeDevices as DeviceData[]) || [];

            // Find and remove the device
            const updatedDevices = currentDevices.filter((d: DeviceData) => d.deviceId !== deviceId);

            if (updatedDevices.length !== currentDevices.length) {
                t.update(userRef, { activeDevices: updatedDevices });
            }
        });

        return { success: true, message: 'Device unregistered.' };

    } catch (error) {
        console.error("Device unregister error:", error);
        throw new functions.https.HttpsError('internal', 'Failed to unregister device.');
    }
});

// ============================================================================
// SUBMIT PAYMENT - Enforces userId and status
// ============================================================================
interface SubmitPaymentData {
    amount: number | string;
    method: string;
    receiptUrl: string;
    notes?: string;
}

export const submitPayment = functions.https.onCall(async (data: SubmitPaymentData, context: CallableContext) => {
    verifyAppCheck(context);

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { amount, method, receiptUrl, notes } = data;

    if (!amount || !method || !receiptUrl) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields (amount, method, receiptUrl).');
    }

    const db = admin.firestore();
    const paymentsRef = db.collection('payments');

    try {
        const result = await db.runTransaction(async (t) => {
            const newPaymentRef = paymentsRef.doc();

            const paymentData = {
                userId: context.auth!.uid, // SECURITY: Enforce identity
                amount: Number(amount),
                method,
                receiptUrl,
                notes: notes || '',
                status: 'pending', // SECURITY: Enforce initial status
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            t.set(newPaymentRef, paymentData);
            return newPaymentRef.id;
        });

        return { success: true, paymentId: result, message: 'Payment submitted successfully.' };
    } catch (error) {
        console.error("Payment submission failure:", error);
        throw new functions.https.HttpsError('internal', 'Failed to submit payment.');
    }
});

// ============================================================================
// DELETE USER DATA - GDPR Compliance (with Storage cleanup)
// ============================================================================
// ============================================================================
// DELETE USER DATA - GDPR Compliance (with Storage cleanup)
// ============================================================================
interface UserDataRequest {
    targetUserId?: string;
}

export const deleteUserData = functions.https.onCall(async (data: UserDataRequest, context: CallableContext) => {
    verifyAppCheck(context);
    // ... rest of implementation ...
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { targetUserId } = data;
    // ...
    // Using simple approach to preserve logic while changing signature
    const requesterId = context.auth.uid;
    const db = admin.firestore();
    const storage = admin.storage().bucket();

    const callerRef = db.collection('users').doc(requesterId);
    const callerSnap = await callerRef.get();
    const isAdmin = callerSnap.data()?.role === 'admin';

    const userIdToDelete = targetUserId || requesterId;

    if (userIdToDelete !== requesterId && !isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot delete other user data.');
    }

    try {
        const batch = db.batch();

        batch.delete(db.collection('users').doc(userIdToDelete));

        const paymentsSnap = await db.collection('payments')
            .where('userId', '==', userIdToDelete)
            .get();

        paymentsSnap.docs.forEach(doc => batch.delete(doc.ref));

        const raisesSnap = await db.collection('hand_raises')
            .where('userId', '==', userIdToDelete)
            .get();

        raisesSnap.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();

        try {
            const [files] = await storage.getFiles({ prefix: `receipts/${userIdToDelete}_` });
            await Promise.all(files.map(file => file.delete()));
            console.log(`Deleted ${files.length} storage files for user ${userIdToDelete}`);
        } catch (storageError) {
            console.error('Storage cleanup error:', storageError);
        }

        try {
            await admin.auth().setCustomUserClaims(userIdToDelete, {});
        } catch (claimsError) {
            console.error('Failed to revoke claims:', claimsError);
        }

        await logAuditAction(db, 'DELETE_USER_DATA', requesterId, userIdToDelete, {
            selfRequest: userIdToDelete === requesterId,
            storageCleanup: true
        });

        return { success: true, message: 'User data deleted.' };

    } catch (error) {
        console.error("Delete user data error:", error);
        throw new functions.https.HttpsError('internal', 'Failed to delete user data.');
    }
});

// ============================================================================
// SYNC USER CLAIMS - Trigger on user document update
// Caches role and subscription status in JWT for reduced Firestore reads
// ============================================================================
export const syncUserClaims = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
        const userId = context.params.userId;
        const newData = change.after.exists ? change.after.data() : null;
        const oldData = change.before.exists ? change.before.data() : null;

        // User deleted
        if (!newData) {
            try {
                await admin.auth().setCustomUserClaims(userId, {});
                console.log(`Cleared claims for deleted user ${userId}`);
            } catch (error) {
                console.error(`Failed to clear claims for ${userId}:`, error);
            }
            return;
        }

        // Check if relevant fields changed
        const relevantFields = ['role', 'subscriptionEnd', 'isSubscribed'];
        const changed = relevantFields.some(field =>
            JSON.stringify(newData[field]) !== JSON.stringify(oldData?.[field])
        );

        if (!changed && oldData) {
            return; // No relevant changes
        }

        // Build custom claims
        const claims: Record<string, string | number | boolean> = {};

        if (newData.role === 'admin') {
            claims.admin = true;
            claims.role = 'admin';
        } else {
            claims.role = newData.role || 'student';
        }

        // Add subscription status
        if (newData.subscriptionEnd) {
            const endDate = newData.subscriptionEnd.toDate
                ? newData.subscriptionEnd.toDate()
                : new Date(newData.subscriptionEnd);
            claims.subscriptionEnd = endDate.getTime();
            claims.isSubscribed = endDate > new Date();
        } else {
            claims.isSubscribed = newData.isSubscribed === true;
        }

        try {
            await admin.auth().setCustomUserClaims(userId, claims);
            console.log(`Updated claims for user ${userId}:`, claims);
        } catch (error) {
            console.error(`Failed to set claims for ${userId}:`, error);
        }
    });

// ============================================================================
// EXPORT USER DATA - GDPR Compliance
// ============================================================================
export const exportUserData = functions.https.onCall(async (data: UserDataRequest, context: CallableContext) => {
    verifyAppCheck(context);

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { targetUserId } = data;
    const requesterId = context.auth.uid;
    const db = admin.firestore();

    const callerRef = db.collection('users').doc(requesterId);
    const callerSnap = await callerRef.get();
    const isAdmin = callerSnap.data()?.role === 'admin';

    const userIdToExport = targetUserId || requesterId;

    if (userIdToExport !== requesterId && !isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot export other user data.');
    }

    try {
        const exportData: Record<string, unknown> = {
            exportedAt: new Date().toISOString(),
            userId: userIdToExport
        };

        const userSnap = await db.collection('users').doc(userIdToExport).get();
        exportData.profile = userSnap.exists ? userSnap.data() : null;

        const paymentsSnap = await db.collection('payments')
            .where('userId', '==', userIdToExport)
            .get();
        exportData.payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const raisesSnap = await db.collection('hand_raises')
            .where('userId', '==', userIdToExport)
            .get();
        exportData.handRaises = raisesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        await logAuditAction(db, 'EXPORT_USER_DATA', requesterId, userIdToExport, {
            selfRequest: userIdToExport === requesterId
        });

        return { success: true, data: exportData };

    } catch (error) {
        console.error("Export user data error:", error);
        throw new functions.https.HttpsError('internal', 'Failed to export user data.');
    }
});

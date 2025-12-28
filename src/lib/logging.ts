
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export async function logErrorToFirestore(error: Error, info?: { componentStack?: string }, user?: User | null) {
    try {
        const errorsRef = collection(db, "system_errors");
        await addDoc(errorsRef, {
            message: error.message || "Unknown Error",
            stack: error.stack || null,
            componentStack: info?.componentStack || null,
            uid: user?.uid || "anonymous",
            userAgent: navigator.userAgent,
            timestamp: serverTimestamp(),
            url: window.location.href
        });
        console.error("Logged error to Firestore:", error);
    } catch (loggingError) {
        console.error("Failed to log error to Firestore:", loggingError);
    }
}

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface StudentData {
    uid: string;
    fullName?: string;
    wilaya?: string;
    major?: string;
    email?: string;
    role?: string;
    isSubscribed?: boolean;
    createdAt?: any;
    lastLogin?: any;
}

export async function saveStudentData(data: Partial<StudentData> & { uid: string }, options?: { isNewUser?: boolean }) {
    const userRef = doc(db, "users", data.uid);

    const payload: any = {
        ...data,
        lastLogin: serverTimestamp()
    };

    if (options?.isNewUser) {
        payload.role = payload.role ?? "student";
        payload.isSubscribed = payload.isSubscribed ?? false;
        payload.createdAt = serverTimestamp();
    }

    await setDoc(userRef, payload, { merge: true });
}

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { firebaseAuth, db, FirebaseAuthTypes } from '@/lib/firebase';
import { registerForPushNotifications, removePushTokenFromFirestore } from '@/lib/notifications';

/**
 * User data stored in Firestore
 * Matches web schema from src/lib/user.ts
 */
interface UserData {
    uid: string;
    email: string | null;
    displayName: string;
    photoURL: string;
    role: 'admin' | 'student';
    isSubscribed: boolean;
    subscriptionEnd?: Date | null;
    wilaya?: string;
    major?: string;
    createdAt: Date;
}

interface AuthContextType {
    user: FirebaseAuthTypes.User | null;
    userData: UserData | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSubscribed: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    isSubscribed: false,
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
    error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Fetch user data from Firestore
                    const userDoc = await db.collection('users').doc(currentUser.uid).get();

                    if (userDoc.exists) {
                        const data = userDoc.data();
                        setUserData({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: data?.displayName || currentUser.displayName || '',
                            photoURL: data?.photoURL || currentUser.photoURL || '',
                            role: data?.role || 'student',
                            isSubscribed: data?.isSubscribed || false,
                            subscriptionEnd: data?.subscriptionEnd?.toDate() || null,
                            wilaya: data?.wilaya,
                            major: data?.major,
                            createdAt: data?.createdAt?.toDate() || new Date(),
                        });
                    } else {
                        // First login - create user document
                        const newUserData: Partial<UserData> = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName || '',
                            photoURL: currentUser.photoURL || '',
                            role: 'student',
                            isSubscribed: false,
                            createdAt: new Date(),
                        };

                        await db.collection('users').doc(currentUser.uid).set(newUserData);
                        setUserData(newUserData as UserData);
                    }

                    // Register for push notifications
                    await registerForPushNotifications(currentUser.uid);
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setError('حدث خطأ في تحميل بيانات المستخدم');
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);

        try {
            await firebaseAuth.signInWithEmailAndPassword(email, password);
        } catch (err: unknown) {
            const firebaseError = err as { code?: string; message?: string };
            let errorMessage = 'حدث خطأ في تسجيل الدخول';

            switch (firebaseError.code) {
                case 'auth/invalid-email':
                    errorMessage = 'البريد الإلكتروني غير صالح';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'تم تعطيل هذا الحساب';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'لا يوجد حساب بهذا البريد الإلكتروني';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'كلمة المرور غير صحيحة';
                    break;
            }

            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    }, []);

    // Signup function
    const signup = useCallback(async (email: string, password: string, displayName: string) => {
        setError(null);
        setLoading(true);

        try {
            const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);

            // Update display name
            await credential.user.updateProfile({ displayName });

            // Create user document in Firestore
            await db.collection('users').doc(credential.user.uid).set({
                uid: credential.user.uid,
                email: email,
                displayName: displayName,
                photoURL: '',
                role: 'student',
                isSubscribed: false,
                createdAt: new Date(),
            });
        } catch (err: unknown) {
            const firebaseError = err as { code?: string; message?: string };
            let errorMessage = 'حدث خطأ في إنشاء الحساب';

            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'البريد الإلكتروني غير صالح';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'كلمة المرور ضعيفة جداً';
                    break;
            }

            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            if (user) {
                // Remove push token before signing out
                await removePushTokenFromFirestore(user.uid);
            }
            await firebaseAuth.signOut();
            setUser(null);
            setUserData(null);
        } catch (err) {
            console.error('Logout error:', err);
            setError('حدث خطأ في تسجيل الخروج');
        }
    }, [user]);

    // Computed values
    const isAuthenticated = !!user && !!userData;
    const isAdmin = userData?.role === 'admin';
    const isSubscribed = isAdmin || (userData?.isSubscribed ?? false) ||
        (userData?.subscriptionEnd ? new Date(userData.subscriptionEnd) > new Date() : false);

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            isAuthenticated,
            isAdmin,
            isSubscribed,
            login,
            signup,
            logout,
            error,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

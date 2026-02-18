import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '@/lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    initialize: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data() as User;
                    set({ user: userData, isLoading: false });
                } else {
                    // If auth exists but no firestore doc (e.g. fresh google sign in), 
                    // we handle it in the login function or leave user null until doc created
                    set({ user: null, isLoading: false });
                }
            } else {
                set({ user: null, isLoading: false });
            }
        });

        return () => unsubscribe();
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    signup: async (email, password, name) => {
        set({ isLoading: true });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // MAGIC ROLE ASSIGNMENT
            let finalRole = 'patient';
            if (email.startsWith('admin')) {
                finalRole = 'admin';
            } else if (email.startsWith('doctor')) {
                finalRole = 'doctor';
            } else {
                finalRole = 'patient'; // Force everyone else to be a patient
            }

            const newUser: User = {
                uid: user.uid,
                email: user.email!,
                displayName: name,
                role: finalRole as any,
                photoURL: user.photoURL || undefined
            };

            await setDoc(doc(db, 'users', user.uid), newUser);
            set({ user: newUser, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user doc if it doesn't exist

                // MAGIC ROLE ASSIGNMENT
                let finalRole = 'patient';
                if (user.email!.startsWith('admin')) {
                    finalRole = 'admin';
                } else if (user.email!.startsWith('doctor')) {
                    finalRole = 'doctor';
                }

                const newUser: User = {
                    uid: user.uid,
                    email: user.email!,
                    displayName: user.displayName || 'Google User',
                    role: finalRole as any,
                    photoURL: user.photoURL || undefined
                };
                await setDoc(userDocRef, newUser);
                set({ user: newUser, isLoading: false });
            }
            // If user exists, we rely on the onAuthStateChanged listener to update state
            // but we might want to ensure the role matches or update it? 
            // For now, respect existing role in DB.

        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await signOut(auth);
            set({ user: null, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },
}));

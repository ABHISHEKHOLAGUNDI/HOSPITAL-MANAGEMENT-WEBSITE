import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    uid: string;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    displayName?: string;
    photoURL?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    signup: (email: string, password?: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            error: null,

            login: async (email) => {
                set({ isLoading: true, error: null });
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));

                let role: 'patient' | 'doctor' | 'admin' = 'patient';
                if (email.startsWith('admin')) role = 'admin';
                else if (email.startsWith('doctor')) role = 'doctor';

                const mockUser: User = {
                    uid: email, // Use email as mock UID
                    email,
                    role,
                    displayName: email.split('@')[0],
                };
                set({ user: mockUser, isLoading: false });
            },

            loginWithGoogle: async () => {
                // Mock Google login
                set({ isLoading: true, error: null });
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockUser: User = {
                    uid: 'google_user_123',
                    email: 'google@patient.com',
                    role: 'patient',
                    displayName: 'Google User',
                };
                set({ user: mockUser, isLoading: false });
            },

            signup: async (email, _password, name) => {
                set({ isLoading: true, error: null });
                await new Promise(resolve => setTimeout(resolve, 500));

                let role: 'patient' | 'doctor' | 'admin' = 'patient';
                if (email.startsWith('admin')) role = 'admin';
                else if (email.startsWith('doctor')) role = 'doctor';

                const mockUser: User = {
                    uid: email,
                    email,
                    role,
                    displayName: name || email.split('@')[0],
                };
                set({ user: mockUser, isLoading: false });
            },

            logout: async () => {
                set({ user: null });
            },

            initialize: () => {
                // Zustand persist middleware automatically hydrates the state,
                // so we don't need to do anything here except clear loading state 
                // that might be hanging from initial mount.
                set({ isLoading: false });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }), // Only persist the user object
        }
    )
);

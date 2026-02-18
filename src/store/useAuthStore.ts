import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null, // Start with no user
    isLoading: true,
    login: (user) => set({ user, isLoading: false }),
    logout: () => set({ user: null, isLoading: false }),
    setUser: (user) => set({ user, isLoading: false }),
}));

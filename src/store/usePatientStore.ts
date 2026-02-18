import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Patient {
    id: string;
    uid: string; // Same as id usually
    displayName: string;
    email: string;
    role: 'patient';
}

interface PatientStore {
    patients: Patient[];
    isLoading: boolean;
    error: string | null;
    searchPatients: (searchTerm: string) => Promise<void>;
    clearSearch: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
    patients: [],
    isLoading: false,
    error: null,

    searchPatients: async (searchTerm) => {
        if (!searchTerm.trim()) return;
        set({ isLoading: true, error: null });
        try {
            // Simple search by email or exact name match (Firestore is limited on substring search without external tools like Algolia)
            // For this demo, we will search by email as it's exact, or we can fetch a batch and filter client side if the dataset is small.
            // Let's rely on email for exact match first, or fetches with 'startAt' for name prefix if compatible.
            // PRO APPROACH: Fetch 'users' where role == 'patient'. Client side filter for demo purposes (assuming < 100 users).

            const q = query(collection(db, 'users'), where('role', '==', 'patient'));
            const querySnapshot = await getDocs(q);

            const allPatients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Patient[];

            const filtered = allPatients.filter(p =>
                p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            set({ patients: filtered, isLoading: false });
        } catch (error: any) {
            console.error("Error searching patients:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    clearSearch: () => set({ patients: [], error: null })
}));

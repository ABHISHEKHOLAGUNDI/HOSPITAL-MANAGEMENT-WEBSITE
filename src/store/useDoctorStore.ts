import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Doctor {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    specialty?: string;
}

interface DoctorStore {
    doctors: Doctor[];
    isLoading: boolean;
    error: string | null;
    fetchDoctors: () => Promise<void>;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
    doctors: [],
    isLoading: false,
    error: null,

    fetchDoctors: async () => {
        set({ isLoading: true, error: null });
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
            const querySnapshot = await getDocs(q);

            const doctors = querySnapshot.docs.map(doc => ({
                uid: doc.id, // Store uid as top level for easier access
                ...doc.data()
            })) as Doctor[];

            set({ doctors, isLoading: false });
        } catch (error: any) {
            console.error("Error fetching doctors:", error);
            set({ error: error.message, isLoading: false });
        }
    }
}));

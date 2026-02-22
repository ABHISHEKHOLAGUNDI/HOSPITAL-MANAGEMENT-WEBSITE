import { create } from 'zustand';

export interface Doctor {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    specialty?: string;
}

// Mock data for pure frontend demonstration
const MOCK_DOCTORS: Doctor[] = [
    { uid: 'doctor@1.com', email: 'doctor@1.com', displayName: 'Dr. Sarah Smith', specialty: 'Orthodontics' },
    { uid: 'doctor@2.com', email: 'doctor@2.com', displayName: 'Dr. John Doe', specialty: 'General Dentistry' },
    { uid: 'doctor@3.com', email: 'doctor@3.com', displayName: 'Dr. Emily Chen', specialty: 'Pediatric Dentistry' },
];

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

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        set({ doctors: MOCK_DOCTORS, isLoading: false });
    }
}));

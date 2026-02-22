import { create } from 'zustand';

export interface Patient {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    role: 'patient';
}

// Mock data for pure frontend demonstration
const MOCK_PATIENTS: Patient[] = [
    { id: 'patient1', uid: 'patient1', email: 'alice@patient.com', displayName: 'Alice Johnson', role: 'patient' },
    { id: 'patient2', uid: 'patient2', email: 'bob@patient.com', displayName: 'Bob Williams', role: 'patient' },
    { id: 'patient3', uid: 'patient3', email: 'charlie@patient.com', displayName: 'Charlie Brown', role: 'patient' },
    { id: 'abhishekholagundi@gmail.com', uid: 'abhishekholagundi@gmail.com', email: 'abhishekholagundi@gmail.com', displayName: 'Abhishek', role: 'patient' },
];

interface PatientStore {
    patients: Patient[];
    isLoading: boolean;
    error: string | null;
    searchPatients: (searchTerm: string) => Promise<void>;
    fetchAllPatients: () => Promise<void>;
    clearSearch: () => void;
}

export const usePatientStore = create<PatientStore>((set) => ({
    patients: [],
    isLoading: false,
    error: null,

    fetchAllPatients: async () => {
        set({ isLoading: true, error: null });
        await new Promise(resolve => setTimeout(resolve, 300));
        set({ patients: MOCK_PATIENTS, isLoading: false });
    },

    searchPatients: async (searchTerm) => {
        if (!searchTerm.trim()) return;
        set({ isLoading: true, error: null });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const filtered = MOCK_PATIENTS.filter(p =>
            p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        set({ patients: filtered, isLoading: false });
    },

    clearSearch: () => set({ patients: [], error: null })
}));

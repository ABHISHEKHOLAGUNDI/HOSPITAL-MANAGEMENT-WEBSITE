import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Patient {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    role: 'patient';
    insuranceProvider?: string;
}

// Mock data for pure frontend demonstration
const MOCK_PATIENTS: Patient[] = [
    { id: 'patient1', uid: 'patient1', email: 'alice@patient.com', displayName: 'Alice Johnson', role: 'patient', insuranceProvider: 'BlueCross BlueShield' },
    { id: 'patient2', uid: 'patient2', email: 'bob@patient.com', displayName: 'Bob Williams', role: 'patient', insuranceProvider: 'Aetna' },
    { id: 'patient3', uid: 'patient3', email: 'charlie@patient.com', displayName: 'Charlie Brown', role: 'patient' },
    { id: 'abhishekholagundi@gmail.com', uid: 'abhishekholagundi@gmail.com', email: 'abhishekholagundi@gmail.com', displayName: 'Abhishek', role: 'patient', insuranceProvider: 'Cigna' },
];

interface PatientStore {
    patients: Patient[];
    searchResults: Patient[];
    isLoading: boolean;
    error: string | null;
    searchPatients: (searchTerm: string) => Promise<void>;
    fetchAllPatients: () => Promise<void>;
    clearSearch: () => void;
    addPatient: (patient: Patient) => void;
}

export const usePatientStore = create<PatientStore>()(
    persist(
        (set, get) => ({
            patients: MOCK_PATIENTS,
            searchResults: [],
            isLoading: false,
            error: null,

            fetchAllPatients: async () => {
                set({ isLoading: true, error: null });
                await new Promise(resolve => setTimeout(resolve, 300));
                // Don't overwrite if we already have persisted patients
                if (get().patients.length === 0) set({ patients: MOCK_PATIENTS });
                set({ isLoading: false });
            },

            searchPatients: async (searchTerm) => {
                if (!searchTerm.trim()) {
                    set({ searchResults: [] });
                    return;
                }
                set({ isLoading: true, error: null });

                await new Promise(resolve => setTimeout(resolve, 300));

                const filtered = get().patients.filter(p =>
                    p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.email.toLowerCase().includes(searchTerm.toLowerCase())
                );

                set({ searchResults: filtered, isLoading: false });
            },

            clearSearch: () => set({ searchResults: [], error: null }),

            addPatient: (patient) => {
                set({ patients: [...get().patients, patient] });
            }
        }),
        {
            name: 'hospital-patient-storage',
            partialize: (state) => ({ patients: state.patients }),
        }
    )
);

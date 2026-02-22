import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Appointment {
    id: string; // no longer optional since we generate it
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    price: string;
    createdAt: string;
}

interface AppointmentState {
    allAppointments: Appointment[]; // Master list persisted
    appointments: Appointment[]; // Filtered list for current view
    isLoading: boolean;
    error: string | null;
    currentSubscription: { type: 'patient' | 'doctor' | 'all', id?: string } | null;

    bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'> & { status?: Appointment['status'] }) => Promise<void>;
    updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
    cancelAppointment: (id: string) => Promise<void>;
    rescheduleAppointment: (id: string, newDate: string, newTime: string) => Promise<void>;

    subscribeToPatientAppointments: (patientId: string) => void;
    subscribeToDoctorAppointments: (doctorId: string) => void;
    subscribeToAllAppointments: () => void;
    cleanup: () => void;

    _applyFilter: () => void; // internal helper
}

export const useAppointmentStore = create<AppointmentState>()(
    persist(
        (set, get) => ({
            allAppointments: [],
            appointments: [],
            isLoading: false,
            error: null,
            currentSubscription: null,

            _applyFilter: () => {
                const { allAppointments, currentSubscription } = get();
                if (!currentSubscription) {
                    set({ appointments: [] });
                    return;
                }

                let filtered = [...allAppointments];
                if (currentSubscription.type === 'patient') {
                    filtered = filtered.filter(a => a.patientId === currentSubscription.id);
                } else if (currentSubscription.type === 'doctor') {
                    filtered = filtered.filter(a => a.doctorId === currentSubscription.id);
                }
                // If type === 'all', it remains the full array

                filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                set({ appointments: filtered });
            },

            bookAppointment: async (appointmentData) => {
                set({ isLoading: true, error: null });
                await new Promise(resolve => setTimeout(resolve, 300));

                const newAppointment: Appointment = {
                    ...appointmentData,
                    id: Math.random().toString(36).substring(2, 11),
                    status: appointmentData.status || 'pending',
                    createdAt: new Date().toISOString(),
                };

                const currentAll = get().allAppointments;
                set({ allAppointments: [...currentAll, newAppointment], isLoading: false });
                get()._applyFilter();
            },

            updateAppointmentStatus: async (id, status) => {
                const currentAll = get().allAppointments;
                const updated = currentAll.map(apt => apt.id === id ? { ...apt, status } : apt);
                set({ allAppointments: updated });
                get()._applyFilter();
            },

            cancelAppointment: async (id) => {
                const currentAll = get().allAppointments;
                const updated = currentAll.map(apt => apt.id === id ? { ...apt, status: 'cancelled' as const } : apt);
                set({ allAppointments: updated });
                get()._applyFilter();
            },

            rescheduleAppointment: async (id, newDate, newTime) => {
                set({ isLoading: true, error: null });
                await new Promise(resolve => setTimeout(resolve, 300));
                const currentAll = get().allAppointments;
                const updated = currentAll.map(apt => apt.id === id ? { ...apt, date: newDate, time: newTime, status: 'confirmed' as const } : apt);
                set({ allAppointments: updated, isLoading: false });
                get()._applyFilter();
            },

            subscribeToPatientAppointments: (patientId) => {
                set({ currentSubscription: { type: 'patient', id: patientId } });
                get()._applyFilter();
            },

            subscribeToDoctorAppointments: (doctorId) => {
                set({ currentSubscription: { type: 'doctor', id: doctorId } });
                get()._applyFilter();
            },

            subscribeToAllAppointments: () => {
                set({ currentSubscription: { type: 'all' } });
                get()._applyFilter();
            },

            cleanup: () => {
                set({ currentSubscription: null, appointments: [] });
            }
        }),
        {
            name: 'appointment-storage',
            partialize: (state) => ({ allAppointments: state.allAppointments }), // Only persist allAppointments
        }
    )
);

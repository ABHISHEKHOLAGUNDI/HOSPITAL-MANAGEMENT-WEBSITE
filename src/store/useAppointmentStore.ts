import { create } from 'zustand';
import { useNotificationStore } from '@/store/useNotificationStore';

export interface Appointment {
    id: string;
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
    allAppointments: Appointment[]; // Master list fetched from D1
    appointments: Appointment[]; // Filtered list for current view
    isLoading: boolean;
    error: string | null;
    currentSubscription: { type: 'patient' | 'doctor' | 'all', id?: string } | null;

    fetchAppointments: () => Promise<void>;
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
    (set, get) => ({
        allAppointments: [],
        appointments: [],
        isLoading: false,
        error: null,
        currentSubscription: null,

        fetchAppointments: async () => {
            set({ isLoading: true, error: null });
            try {
                const res = await fetch('/api/appointments');
                if (!res.ok) throw new Error('Failed to fetch appointments from D1');
                const data = await res.json();
                set({ allAppointments: data, isLoading: false });
                get()._applyFilter();
            } catch (error: any) {
                console.error("Fetch DB error:", error);
                set({ error: error.message, isLoading: false });
            }
        },

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

            const newAppointment = {
                ...appointmentData,
                id: Math.random().toString(36).substring(2, 11),
                status: appointmentData.status || 'pending',
                createdAt: new Date().toISOString(),
            };

            try {
                const res = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newAppointment)
                });

                if (!res.ok) throw new Error('Failed to save to D1 database');

                // Optimistic UI update
                const currentAll = get().allAppointments;
                set({ allAppointments: [...currentAll, newAppointment as Appointment], isLoading: false });
                get()._applyFilter();

                // Trigger Notifications
                const { addNotification } = useNotificationStore.getState();
                addNotification(newAppointment.doctorId, 'New Appointment', `Patient ${newAppointment.patientName} booked an appointment for ${newAppointment.date} at ${newAppointment.time}.`);
                addNotification(newAppointment.patientId, 'Appointment Booked', `Your appointment with Dr. ${newAppointment.doctorName} is pending confirmation.`);

            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                throw error;
            }
        },

        updateAppointmentStatus: async (id, status) => {
            // Optimistic UI update
            const currentAll = get().allAppointments;
            const updated = currentAll.map(apt => apt.id === id ? { ...apt, status } : apt);
            set({ allAppointments: updated });
            get()._applyFilter();

            const targetApt = currentAll.find(a => a.id === id);
            if (targetApt) {
                const { addNotification } = useNotificationStore.getState();
                addNotification(targetApt.patientId, 'Status Update', `Your appointment on ${targetApt.date} has been ${status}.`);
            }

            try {
                await fetch(`/api/appointments/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
            } catch (error) {
                console.error("Failed to update status in DB:", error);
                // Revert optimistic update could go here
            }
        },

        cancelAppointment: async (id) => {
            // Optimistic UI update
            const currentAll = get().allAppointments;
            const updated = currentAll.map(apt => apt.id === id ? { ...apt, status: 'cancelled' as const } : apt);
            set({ allAppointments: updated });
            get()._applyFilter();

            const targetApt = currentAll.find(a => a.id === id);
            if (targetApt) {
                const { addNotification } = useNotificationStore.getState();
                addNotification(targetApt.patientId, 'Appointment Cancelled', `Your appointment with Dr. ${targetApt.doctorName} on ${targetApt.date} was cancelled.`);
                addNotification(targetApt.doctorId, 'Appointment Cancelled', `Patient ${targetApt.patientName} cancelled their appointment on ${targetApt.date}.`);
            }

            try {
                await fetch(`/api/appointments/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled' })
                });
            } catch (error) {
                console.error("Failed to cancel in DB:", error);
            }
        },

        rescheduleAppointment: async (id, newDate, newTime) => {
            set({ isLoading: true, error: null });
            // For now, this is un-backed by API since we don't have a specific endpoint, 
            // but we'd typically send a PUT to update date/time fields.
            await new Promise(resolve => setTimeout(resolve, 300));
            const currentAll = get().allAppointments;
            const updated = currentAll.map(apt => apt.id === id ? { ...apt, date: newDate, time: newTime, status: 'confirmed' as const } : apt);
            set({ allAppointments: updated, isLoading: false });
            get()._applyFilter();

            const targetApt = currentAll.find(a => a.id === id);
            if (targetApt) {
                const { addNotification } = useNotificationStore.getState();
                addNotification(targetApt.patientId, 'Appointment Rescheduled', `Your appointment is rescheduled to ${newDate} at ${newTime}.`);
                addNotification(targetApt.doctorId, 'Appointment Rescheduled', `Patient ${targetApt.patientName}'s appointment rescheduled to ${newDate} at ${newTime}.`);
            }
        },

        subscribeToPatientAppointments: (patientId) => {
            // Trigger a fetch when subscribing to ensure fresh data
            get().fetchAppointments();
            set({ currentSubscription: { type: 'patient', id: patientId } });
        },

        subscribeToDoctorAppointments: (doctorId) => {
            get().fetchAppointments();
            set({ currentSubscription: { type: 'doctor', id: doctorId } });
        },

        subscribeToAllAppointments: () => {
            get().fetchAppointments();
            set({ currentSubscription: { type: 'all' } });
        },

        cleanup: () => {
            set({ currentSubscription: null, appointments: [] });
        }
    })
);

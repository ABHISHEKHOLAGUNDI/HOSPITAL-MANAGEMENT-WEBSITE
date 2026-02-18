import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Appointment {
    id?: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    serviceId: string;
    serviceName: string;
    date: string; // ISO string
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    price: string;
    createdAt: string;
}

interface AppointmentState {
    appointments: Appointment[];
    isLoading: boolean;
    error: string | null;
    unsubscribe: (() => void) | null; // Keep track of active listener

    bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'> & { status?: Appointment['status'] }) => Promise<void>;
    updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
    cancelAppointment: (id: string) => Promise<void>;
    rescheduleAppointment: (id: string, newDate: string, newTime: string) => Promise<void>;

    subscribeToPatientAppointments: (patientId: string) => void;
    subscribeToDoctorAppointments: (doctorId: string) => void;
    subscribeToAllAppointments: () => void;
    cleanup: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
    appointments: [],
    isLoading: false,
    error: null,
    unsubscribe: null,

    bookAppointment: async (appointmentData) => {
        set({ isLoading: true, error: null });
        try {
            const newAppointment = {
                ...appointmentData,
                status: appointmentData.status || 'pending', // Allow override or default to pending
                createdAt: new Date().toISOString(),
            };

            await addDoc(collection(db, 'appointments'), newAppointment);
            set({ isLoading: false });
        } catch (error: any) {
            // ...
            console.error("Error booking appointment:", error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateAppointmentStatus: async (id, status) => {
        try {
            const aptRef = doc(db, 'appointments', id);
            await updateDoc(aptRef, { status });
        } catch (error: any) {
            console.error("Error updating appointment:", error);
            throw error;
        }
    },

    cancelAppointment: async (id) => {
        try {
            const aptRef = doc(db, 'appointments', id);
            await updateDoc(aptRef, { status: 'cancelled' });
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            throw error;
        }
    },

    subscribeToPatientAppointments: (patientId) => {
        const { cleanup } = get();
        cleanup(); // Unsubscribe from previous listener

        set({ isLoading: true });
        const q = query(
            collection(db, 'appointments'),
            where('patientId', '==', patientId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Appointment[];

            // Client-side sort
            appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            set({ appointments, isLoading: false, unsubscribe });
        }, (error) => {
            console.error("Error subscribing to appointments:", error);
            set({ error: error.message, isLoading: false });
        });
    },

    subscribeToDoctorAppointments: (doctorId) => {
        const { cleanup } = get();
        cleanup();

        set({ isLoading: true });
        const q = query(
            collection(db, 'appointments'),
            where('doctorId', '==', doctorId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Appointment[];

            appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            set({ appointments, isLoading: false, unsubscribe });
        }, (error) => {
            console.error("Error subscribing to appointments:", error);
            set({ error: error.message, isLoading: false });
        });
    },

    subscribeToAllAppointments: () => {
        const { cleanup } = get();
        cleanup();

        set({ isLoading: true });
        // Fetch all for admin
        const q = query(collection(db, 'appointments'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const appointments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Appointment[];

            appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            set({ appointments, isLoading: false, unsubscribe });
        }, (error) => {
            console.error("Error subscribing to all appointments:", error);
            set({ error: error.message, isLoading: false });
        });
    },

    cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    rescheduleAppointment: async (id, newDate, newTime) => {
        set({ isLoading: true, error: null });
        try {
            const aptRef = doc(db, 'appointments', id);
            await updateDoc(aptRef, {
                date: newDate,
                time: newTime,
                status: 'confirmed' // Re-confirm upon reschedule
            });
            set({ isLoading: false });
        } catch (error: any) {
            console.error("Error rescheduling appointment:", error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));

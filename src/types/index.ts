export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    availableDays: string[];
    shiftStart: string; // HH:mm
    shiftEnd: string;   // HH:mm
    image: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    patientName: string;
    date: string; // ISO date string
    timeSlot: string;
    status: AppointmentStatus;
    type: string; // e.g., 'Checkup', 'Cleaning', 'Surgery'
    notes?: string;
}

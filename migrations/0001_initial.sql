DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS invoices;

-- Roles: Admin, Doctor, Patient
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    displayName TEXT,
    role TEXT NOT NULL DEFAULT 'patient',
    specialty TEXT, -- Only for doctors
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id TEXT PRIMARY KEY,
    patientId TEXT NOT NULL,
    patientName TEXT NOT NULL,
    doctorId TEXT NOT NULL,
    doctorName TEXT NOT NULL,
    serviceId TEXT NOT NULL,
    serviceName TEXT NOT NULL,
    price TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patientId) REFERENCES users(id),
    FOREIGN KEY(doctorId) REFERENCES users(id)
);

CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    appointmentId TEXT NOT NULL,
    patientId TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Paid
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointmentId) REFERENCES appointments(id),
    FOREIGN KEY(patientId) REFERENCES users(id)
);

-- Insert Mock Admins and Doctors to get Started
INSERT INTO users (id, email, displayName, role) VALUES ('admin1', 'admin@hospital.com', 'Super Admin', 'admin');
INSERT INTO users (id, email, displayName, role, specialty) VALUES ('d1', 'doctor@hospital.com', 'Dr. Sarah Johnson', 'doctor', 'General Dentist');
INSERT INTO users (id, email, displayName, role, specialty) VALUES ('d2', 'doctor1@test.com', 'Dr. Michael Chen', 'doctor', 'Orthodontist');
INSERT INTO users (id, email, displayName, role, specialty) VALUES ('d3', 'doctor2@test.com', 'Dr. Emily Davis', 'doctor', 'Endodontist');

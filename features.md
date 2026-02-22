# Next-Gen Dental Hospital Management System
## Complete Feature Documentation (A to Z)

This document outlines every feature available in the application, broken down by User Role (Patient, Doctor, Admin).

---

## 1. Global Platform Features
Features available to all users across the entire application ecosystem.

*   **Authentication System:** Secure email/password login integrated seamlessly with the simulated database.
*   **Role-Based Access Control (RBAC):** The platform intuitively checks if an email belongs to a Doctor, Patient, or Admin and automatically routes them to their specific protective dashboard.
*   **"Medical Future" Design System:** 100% custom UI built on top of Radix UI primitives. Features a glassmorphic aesthetic, smooth framer-motion animations, and responsive layouts that work perfectly on mobile and desktop.
*   **Global Theme Switcher:** A toggle in the top navigation bar allows users to instantly switch the entire platform between "Light Mode" (bright, airy clinic feel) and "Dark Mode" (deep teal and slate for low-light environments).
*   **Smart Global Notifications:** A bell icon in the navigation bar tracks real-time alerts. Users are notified instantly when appointments are booked, rescheduled, or when prescriptions are issued.

---

## 2. The Patient Portal
*The core experience for clients seeking dental care.*

### Landing Page
*   **Dynamic Hero:** Animated entrance showcasing the clinic's brand and immediate "Book Appointment" call to actions.
*   **Services Showcase:** High-end display of available dental procedures (General, Orthodontics, Cosmetics).

### Patient Dashboard
*   **Interactive Booking Wizard:** A multi-step flow that guides patients through:
    1.  Selecting a specific dental service (e.g., Root Canal).
    2.  Choosing an available doctor based on specialty.
    3.  Picking a date and time slot.
    4.  Reviewing costs and confirming the booking.
*   **Live Appointment Tracking:** The dashboard "Overview" tab shows upcoming appointments with dynamic status badges (`Pending`, `Confirmed`, `Completed`).
*   **Appointment History:** A dedicated tab storing a permanent record of all past appointments.
*   **Digital Prescriptions & Invoices:** Patients can view and download official digital copies of their doctor's prescriptions and admin-generated billing invoices directly from their dashboard.

---

## 3. The Doctor Dashboard
*The operational hub for medical professionals.*

### Master Schedule & Calendar
*   **Daily Overview:** Shows today’s queue of patients, along with vital daily statistics (Total Appointments, Pending approvals).
*   **Appointment Management:** Doctors can proactively **Confirm** (accept), **Complete** (finish treatment), or **Reschedule** pending appointments directly from their overview.
*   **Internal Booking Engine:** If a patient calls in, the Doctor can use the "New Booking" modal to manually search the CRM database and assign an appointment directly onto their own schedule.

### Patient EMR (Electronic Medical Records)
*   **Patient Timeline:** When a doctor clicks on a patient, they see a beautiful chronological "Timeline" of all past treatments and completed appointments.
*   **Consultation Notes:** Secure text area to input and save private consultation data for each patient encounter.

### Digital Pharmacy & e-Prescribing
*   **Smart Prescription Builder:** Instead of just typing notes, doctors use an interactive dropdown to select actual medicines built into the clinic's inventory.
*   **Automated Stock Deduction:** When the doctor hits "Generate & Send Rx", the exact quantity of the prescribed medication is instantly deducted from the hospital's central pharmacy database.

---

## 4. The Admin & Reception Dashboard
*The heavy-duty command center for hospital administration.*

### Advanced Reception & Live Queue
*   **Live Waiting Room:** The "Schedule Overview" features a dynamic scrolling list that only shows patients scheduled for *that exact day*, color-coding who is "Waiting" vs "In Clinic."
*   **Quick Walk-In Manager:** Receptionists can instantly add emergency or walk-in patients via a specialized modal. This bypasses the need to create a full patient account, immediately placing them in a specific Doctor's Live Queue.
*   **Global Scheduler:** Admins have the supreme authority to assign any registered patient to any doctor across the entire clinic.

### Advanced Analytics Dashboard
*   **Interactive Revenue Charts:** Powered by `Recharts`, showing real-time monthly/weekly revenue trends dynamically calculated from completed appointments.
*   **Department Distribution:** A visual Pie Chart breaking down exactly which services (e.g., Teeth Cleaning vs Whitening) are generating the most business.

### Itemized Billing & Insurance
*   **Dynamic Invoice Builder:** The billing tab allows admins to construct highly detailed invoices.
*   **Inventory Integration:** Admins can select the primary consultation cost, and then append additional supplies used during the procedure (e.g., Anesthesia, Dental Tools) directly from the clinic's inventory database.
*   **Financial Modifiers:** Input custom Tax percentages and Flat Discounts ($) to automatically calculate the final total bill before publishing it to the patient's portal.

### Supply Chain & Pharmacy
*   **Inventory Control:** A dedicated master list of all clinic medicines and supplies.
*   **Low Stock Alerts:** Items automatically highlight with warning badges when stock drops below minimum thresholds.
*   **One-Click Restock:** Buttons to instantly replenish supplies when clinic shipments arrive.
*   **Directory Exports:** Every table in the admin panel (Appointments, Patients, Inventory, Invoices) features an "Export CSV" button for local record keeping.

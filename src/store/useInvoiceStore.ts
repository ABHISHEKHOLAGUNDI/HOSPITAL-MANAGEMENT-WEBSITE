import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Invoice {
    id: string;
    patientName: string;
    amount: string;
    date: string;
    status: 'Paid' | 'Pending';
    service?: string;
}

interface InvoiceStore {
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;
    setInvoices: (invoices: Invoice[]) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
    persist(
        (set, get) => ({
            invoices: [],

            addInvoice: (invoice) => {
                set({ invoices: [invoice, ...get().invoices] });
            },

            setInvoices: (invoices) => {
                set({ invoices });
            }
        }),
        {
            name: 'hospital-invoice-storage',
        }
    )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Medicine' | 'Supply' | 'Equipment';
    stockLevel: number;
    unitPrice: number;
    threshold: number; // Low stock alert threshold
}

// Initial Mock Data
const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 'INV-001', name: 'Amoxicillin 500mg', category: 'Medicine', stockLevel: 150, unitPrice: 15, threshold: 50 },
    { id: 'INV-002', name: 'Ibuprofen 400mg', category: 'Medicine', stockLevel: 300, unitPrice: 8, threshold: 100 },
    { id: 'INV-003', name: 'Dental Syringes (Box of 100)', category: 'Supply', stockLevel: 12, unitPrice: 45, threshold: 5 },
    { id: 'INV-004', name: 'Lidocaine 2% Injection', category: 'Medicine', stockLevel: 45, unitPrice: 25, threshold: 20 },
    { id: 'INV-005', name: 'Latex Gloves (Large)', category: 'Supply', stockLevel: 80, unitPrice: 12, threshold: 30 },
];

interface InventoryStore {
    items: InventoryItem[];
    isLoading: boolean;
    error: string | null;
    addItem: (item: Omit<InventoryItem, 'id'>) => void;
    updateItem: (id: string, updates: Partial<InventoryItem>) => void;
    deleteItem: (id: string) => void;
    deductStock: (id: string, quantity: number) => void;
}

export const useInventoryStore = create<InventoryStore>()(
    persist(
        (set) => ({
            items: INITIAL_INVENTORY,
            isLoading: false,
            error: null,

            addItem: (itemData) => set((state) => ({
                items: [...state.items, { ...itemData, id: `INV-${Date.now()}` }]
            })),

            updateItem: (id, updates) => set((state) => ({
                items: state.items.map(item =>
                    item.id === id ? { ...item, ...updates } : item
                )
            })),

            deleteItem: (id) => set((state) => ({
                items: state.items.filter(item => item.id !== id)
            })),

            deductStock: (id, quantity) => set((state) => ({
                items: state.items.map(item =>
                    item.id === id ? { ...item, stockLevel: Math.max(0, item.stockLevel - quantity) } : item
                )
            }))
        }),
        {
            name: 'hospital-inventory-storage',
        }
    )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: AppNotification[];

    // Actions
    addNotification: (userId: string, title: string, message: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: (userId: string) => void;
    clearNotifications: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],

            addNotification: (userId, title, message) => {
                const newNotif: AppNotification = {
                    id: Math.random().toString(36).substring(2, 11),
                    userId,
                    title,
                    message,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    notifications: [newNotif, ...state.notifications] // prepend
                }));
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, isRead: true } : n
                    )
                }));
            },

            markAllAsRead: (userId) => {
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.userId === userId ? { ...n, isRead: true } : n
                    )
                }));
            },

            clearNotifications: (userId) => {
                set((state) => ({
                    notifications: state.notifications.filter(n => n.userId !== userId)
                }));
            }
        }),
        {
            name: 'notification-storage',
        }
    )
);

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

    const userNotifications = notifications.filter(n => n.userId === user?.uid);
    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover shadow-md z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="font-semibold text-sm">Notifications</span>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                    onClick={() => markAllAsRead(user.uid)}
                                >
                                    <Check className="h-3 w-3" /> Mark all read
                                </button>
                            )}
                            {userNotifications.length > 0 && (
                                <button
                                    className="text-xs text-destructive hover:underline flex items-center gap-1"
                                    onClick={() => clearNotifications(user.uid)}
                                >
                                    <Trash2 className="h-3 w-3" /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {userNotifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No new notifications
                            </div>
                        ) : (
                            userNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "px-4 py-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                                        !notif.isRead && "bg-primary/5 dark:bg-primary/10"
                                    )}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={cn("text-sm font-medium", !notif.isRead ? "text-foreground" : "text-muted-foreground")}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

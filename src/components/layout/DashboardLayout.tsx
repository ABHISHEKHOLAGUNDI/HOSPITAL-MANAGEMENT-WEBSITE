import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils'; // Keep utilities

interface SidebarLink {
    name: string;
    path: string;
    icon: React.ElementType;
}

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Define links based on role
    const getLinks = (): SidebarLink[] => {
        if (user?.role === 'admin') {
            return [
                { name: 'Overview', path: '/admin', icon: LayoutDashboard },
                { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
                { name: 'Patients', path: '/admin/patients', icon: Users },
                { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
                { name: 'Settings', path: '/admin/settings', icon: Settings },
            ];
        } else if (user?.role === 'doctor') {
            return [
                { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
                { name: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
                { name: 'Patients', path: '/doctor/patients', icon: Users },
                { name: 'Settings', path: '/doctor/settings', icon: Settings },
            ];
        } else {
            // Patient
            return [
                { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
                { name: 'Book Appointment', path: '/patient/book', icon: Calendar },
                { name: 'My History', path: '/patient/history', icon: Activity },
                { name: 'Settings', path: '/patient/settings', icon: Settings },
            ];
        }
    };

    const links = getLinks();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-lg">
                                <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-bold text-lg">DentalCare+</span>
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-muted-foreground"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 py-6 px-3 space-y-1">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                                    )}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 px-3 py-3 mb-2">
                            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-semibold">Dashboard</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

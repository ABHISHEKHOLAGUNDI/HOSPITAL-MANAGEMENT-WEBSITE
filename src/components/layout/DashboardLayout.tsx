import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    LogOut,
    Menu,
    X,
    Stethoscope,
    Activity,
    BarChart,
    Receipt,
    Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from '@/components/NotificationDropdown';

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

    useEffect(() => {
        if (location.pathname === '/' && user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'doctor') navigate('/doctor');
            else navigate('/patient');
        }
    }, [location.pathname, user, navigate]);

    // Define links based on role
    const getLinks = (): SidebarLink[] => {
        if (user?.role === 'admin') {
            return [
                { name: 'Schedule Overview', path: '/admin?tab=overview', icon: LayoutDashboard },
                { name: 'Analytics', path: '/admin?tab=analytics', icon: BarChart },
                { name: 'Patient Directory', path: '/admin?tab=crm', icon: Users },
                { name: 'Billing & Invoicing', path: '/admin?tab=billing', icon: Receipt },
            ];
        } else if (user?.role === 'doctor') {
            return [
                { name: 'Overview', path: '/doctor?tab=overview', icon: LayoutDashboard },
                { name: 'Calendar', path: '/doctor?tab=calendar', icon: Calendar },
                { name: 'Patients & EMR', path: '/doctor?tab=emr', icon: Users },
            ];
        } else {
            // Patient
            return [
                { name: 'Overview', path: '/patient?tab=overview', icon: LayoutDashboard },
                { name: 'Book Appointment', path: '/patient/book', icon: Calendar },
                { name: 'History', path: '/patient?tab=history', icon: Activity },
                { name: 'Prescriptions', path: '/patient?tab=prescriptions', icon: Pill },
                { name: 'Billing', path: '/patient?tab=billing', icon: Receipt },
            ];
        }
    };

    const links = getLinks();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex text-foreground">
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
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                                <Stethoscope className="h-5 w-5" />
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
                            // Extract path without query for active state comparison, 
                            // or compare exact including query if it's a tab link.
                            const isActive = link.path.includes('?tab=')
                                ? location.pathname + location.search === link.path
                                : location.pathname === link.path;

                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
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
                            <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-foreground">{user?.displayName?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-foreground">{user?.displayName || 'User'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
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
                {/* Header */}
                <header className="h-16 bg-card/80 backdrop-blur-sm border-b flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-muted-foreground lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <NotificationDropdown />
                        <ThemeToggle />
                    </div>
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

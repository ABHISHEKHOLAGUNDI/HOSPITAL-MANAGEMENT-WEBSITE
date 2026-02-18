import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/#about' },
        { name: 'Services', path: '/#services' },
        { name: 'Doctors', path: '/#doctors' },
        { name: 'Contact', path: '/#contact' },
    ];

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
                isScrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 py-4'
                    : 'bg-transparent py-6'
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-500">
                            DentalCare<span className="text-primary">Plus</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.path}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Hi, {user.displayName}</span>
                                <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
                                <Button asChild size="sm">
                                    <Link to={`/${user.role}`}>Dashboard</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link to="/login">Log In</Link>
                                </Button>
                                <Button asChild size="sm" className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/20">
                                    <Link to="/login?signup=true">Book Appointment</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.path}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="h-px bg-border my-2" />
                    {user ? (
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium px-2">Hi, {user.displayName}</span>
                            <Button asChild className="w-full">
                                <Link to={`/${user.role}`}>Dashboard</Link>
                            </Button>
                            <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} variant="outline" className="w-full">Logout</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Button asChild variant="ghost" className="w-full justify-start">
                                <Link to="/login">Log In</Link>
                            </Button>
                            <Button asChild className="w-full bg-gradient-to-r from-teal-600 to-teal-500">
                                <Link to="/login?signup=true">Book Appointment</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, XCircle, Loader2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { usePatientStore } from '@/store/usePatientStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock Services for Doctor Booking
const SERVICES = [
    { id: '1', name: 'General Consultation', price: '$50' },
    { id: '2', name: 'Teeth Cleaning', price: '$80' },
    { id: '3', name: 'Whitening', price: '$150' },
    { id: '4', name: 'Root Canal', price: '$300' },
];

const DoctorDashboard = () => {
    const { user } = useAuthStore();
    const { appointments, subscribeToDoctorAppointments, updateAppointmentStatus, rescheduleAppointment, bookAppointment, cleanup, isLoading } = useAppointmentStore();
    const { patients, searchPatients, clearSearch, isLoading: isSearching } = usePatientStore();

    // Local state for modals and forms
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [bookingForm, setBookingForm] = useState({
        serviceId: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        if (user?.uid) {
            subscribeToDoctorAppointments(user.uid);
        }
        return () => cleanup();
    }, [user, subscribeToDoctorAppointments, cleanup]);

    // Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchPatients(searchTerm);
            } else {
                clearSearch();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchPatients, clearSearch]);

    const handleStatusUpdate = async (id: string, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
        try {
            await updateAppointmentStatus(id, newStatus);
            toast.success(`Appointment marked as ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleBookPatient = async () => {
        if (!selectedPatient || !bookingForm.serviceId || !bookingForm.date || !bookingForm.time) {
            toast.error("Please fill in all fields");
            return;
        }

        const service = SERVICES.find(s => s.id === bookingForm.serviceId);

        try {
            await bookAppointment({
                patientId: selectedPatient.uid,
                patientName: selectedPatient.displayName,
                doctorId: user!.uid,
                doctorName: user!.displayName || 'Dr. ' + user!.email,
                serviceId: service!.id,
                serviceName: service!.name,
                price: service!.price,
                date: new Date(bookingForm.date).toISOString(),
                time: bookingForm.time,
                status: 'confirmed' // Doctors book confirmed appointments directly
            });
            setIsBookingOpen(false);
            setBookingForm({ serviceId: '', date: '', time: '' });
            setSelectedPatient(null);
            setSearchTerm('');
            toast.success("Appointment booked successfully for patient!");
        } catch (error) {
            toast.error("Failed to book appointment");
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleId || !bookingForm.date || !bookingForm.time) return;
        try {
            // Combine date and time to ISO if needed, but our store takes them separate currently based on previous code usually acting on simplified strings.
            // Actually store takes string date and string time.
            // We need to ensure date is ISO string formatting if that's what we store.
            const dateObj = new Date(bookingForm.date);
            await rescheduleAppointment(rescheduleId, dateObj.toISOString(), bookingForm.time);

            setRescheduleId(null);
            setBookingForm({ serviceId: '', date: '', time: '' });
            toast.success("Appointment rescheduled!");
        } catch (error) {
            toast.error("Failed to reschedule");
        }
    }

    const stats = [
        { title: 'Total Patients', value: '1,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Appointments Today', value: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length.toString(), icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-100' },
        { title: 'Pending Actions', value: appointments.filter(a => a.status === 'pending').length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, Dr. {user?.displayName}</p>
                </div>
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Plus className="h-4 w-4" /> New Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Book Appointment for Patient</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Patient</Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="border rounded-md max-h-40 overflow-y-auto bg-slate-50 mt-1">
                                        {isSearching ? (
                                            <div className="p-2 text-xs text-center">Searching...</div>
                                        ) : patients.length > 0 ? (
                                            patients.map(p => (
                                                <div
                                                    key={p.id}
                                                    className={cn(
                                                        "p-2 text-sm cursor-pointer hover:bg-teal-50",
                                                        selectedPatient?.id === p.id && "bg-teal-100 font-medium"
                                                    )}
                                                    onClick={() => { setSelectedPatient(p); setSearchTerm(p.displayName || p.email); }}
                                                >
                                                    {p.displayName} <span className="text-xs text-muted-foreground">({p.email})</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-center text-muted-foreground">No patients found.</div>
                                        )}
                                    </div>
                                )}
                                {selectedPatient && <div className="text-xs text-green-600">Selected: {selectedPatient.displayName}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Service</Label>
                                <Select onValueChange={(val) => setBookingForm({ ...bookingForm, serviceId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICES.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.price})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleBookPatient}>Book Appointment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Reschedule Modal */}
            <Dialog open={!!rescheduleId} onOpenChange={(open) => !open && setRescheduleId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reschedule Appointment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>New Date</Label>
                                <Input type="date" onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>New Time</Label>
                                <Input type="time" onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleReschedule}>Confirm New Time</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-full`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Appointment Manager */}
            <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.length > 0 ? appointments.map((apt) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                                            {apt.patientName?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{apt.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{apt.serviceName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                            <Clock className="h-4 w-4" /> {format(new Date(apt.date), 'MMM d')} at {apt.time}
                                        </div>

                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            apt.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                                apt.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                                                    apt.status === 'completed' ? "bg-blue-100 text-blue-800" :
                                                        "bg-red-100 text-red-800"
                                        )}>
                                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                        </span>

                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setRescheduleId(apt.id!)}>
                                                Reschedule
                                            </Button>
                                            {apt.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusUpdate(apt.id!, 'confirmed')}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleStatusUpdate(apt.id!, 'cancelled')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {apt.status === 'confirmed' && (
                                                <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" onClick={() => handleStatusUpdate(apt.id!, 'completed')}>
                                                    Mark Complete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No appointments found for your ID.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorDashboard;

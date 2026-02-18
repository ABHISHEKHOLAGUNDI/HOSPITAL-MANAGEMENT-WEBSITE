import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, TrendingUp, Loader2, Plus, Search, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { usePatientStore } from '@/store/usePatientStore';
import { useDoctorStore } from '@/store/useDoctorStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock Services
const SERVICES = [
    { id: '1', name: 'General Consultation', price: '$50' },
    { id: '2', name: 'Teeth Cleaning', price: '$80' },
    { id: '3', name: 'Whitening', price: '$150' },
    { id: '4', name: 'Root Canal', price: '$300' },
];

const AdminDashboard = () => {
    const { user } = useAuthStore();
    const { appointments, subscribeToAllAppointments, cleanup, isLoading, bookAppointment } = useAppointmentStore();
    const { patients, searchPatients, clearSearch, isLoading: isSearching } = usePatientStore();
    const { doctors, fetchDoctors } = useDoctorStore();

    // Assignment State
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [assignmentForm, setAssignmentForm] = useState({
        doctorId: '',
        serviceId: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        subscribeToAllAppointments();
        fetchDoctors(); // Load doctors for assignment dropdown
        return () => cleanup();
    }, [subscribeToAllAppointments, cleanup, fetchDoctors]);

    // Search Debounce
    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm) searchPatients(searchTerm);
            else clearSearch();
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm, searchPatients, clearSearch]);


    const handleAssign = async () => {
        if (!selectedPatient || !assignmentForm.doctorId || !assignmentForm.serviceId || !assignmentForm.date || !assignmentForm.time) {
            toast.error("Please fill in all fields");
            return;
        }

        const service = SERVICES.find(s => s.id === assignmentForm.serviceId);
        const doctor = doctors.find(d => d.uid === assignmentForm.doctorId);

        try {
            await bookAppointment({
                patientId: selectedPatient.uid,
                patientName: selectedPatient.displayName,
                doctorId: doctor!.uid,
                doctorName: doctor!.displayName || 'Dr. ' + doctor!.email,
                serviceId: service!.id,
                serviceName: service!.name,
                price: service!.price,
                date: new Date(assignmentForm.date).toISOString(),
                time: assignmentForm.time,
                status: 'confirmed'
            });

            setIsAssignOpen(false);
            setAssignmentForm({ doctorId: '', serviceId: '', date: '', time: '' });
            setSelectedPatient(null);
            setSearchTerm('');
            toast.success(`Appointment assigned to ${doctor?.displayName}`);
        } catch (error) {
            toast.error("Failed to assign appointment");
        }
    };

    // Calculate Real Stats
    const totalRevenue = appointments
        .filter(a => a.status === 'completed' || a.status === 'confirmed')
        .reduce((acc, curr) => acc + (parseFloat(curr.price.replace('$', '')) || 0), 0);

    const activePatients = new Set(appointments.map(a => a.patientId)).size;
    const totalAppointments = appointments.length;

    const today = new Date().toDateString();
    const appointmentsToday = appointments.filter(a => new Date(a.date).toDateString() === today).length;

    const recentActivity = appointments.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Terminal</h1>
                    <p className="text-muted-foreground">Manage system resources and assign appointments.</p>
                </div>

                <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                            <Stethoscope className="h-4 w-4" /> Assign Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Assign Patient to Doctor</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Patient Search */}
                            <div className="space-y-2">
                                <Label>1. Select Patient</Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search patient name/email..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="border rounded-md max-h-40 overflow-y-auto bg-slate-50 mt-1">
                                        {isSearching ? <div className="p-2 text-xs">Searching...</div> :
                                            patients.length > 0 ? patients.map(p => (
                                                <div key={p.id} className={cn("p-2 text-sm cursor-pointer hover:bg-purple-50", selectedPatient?.id === p.id && "bg-purple-100")}
                                                    onClick={() => { setSelectedPatient(p); setSearchTerm(p.displayName || p.email); }}>
                                                    {p.displayName} <span className="opacity-50">({p.email})</span>
                                                </div>
                                            )) : <div className="p-2 text-xs text-muted-foreground">No patients found.</div>}
                                    </div>
                                )}
                            </div>

                            {/* Doctor Select */}
                            <div className="space-y-2">
                                <Label>2. Assign Doctor</Label>
                                <Select onValueChange={(val) => setAssignmentForm({ ...assignmentForm, doctorId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Doctor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(d => (
                                            <SelectItem key={d.uid} value={d.uid}>{d.displayName || d.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" onChange={(e) => setAssignmentForm({ ...assignmentForm, date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" onChange={(e) => setAssignmentForm({ ...assignmentForm, time: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Service</Label>
                                <Select onValueChange={(val) => setAssignmentForm({ ...assignmentForm, serviceId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                                    <SelectContent>
                                        {SERVICES.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.price})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleAssign}>Confirm Assignment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projected Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Based on confirmed bookings</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePatients}</div>
                        <p className="text-xs text-muted-foreground">Patients with bookings</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Volume</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{appointmentsToday}</div>
                        <p className="text-xs text-muted-foreground">Appointments for {format(new Date(), 'MMM d')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white/60 backdrop-blur-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {/* Placeholder for a chart - using a simple list for now as requested by user to be practical */}
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground bg-slate-100/50 rounded-lg p-4">
                            <p>Revenue Stream Visualization</p>
                            <div className="w-full h-2 bg-slate-200 mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
                            </div>
                            <div className="flex justify-between w-full mt-2 text-xs">
                                <span>General Dentistry (65%)</span>
                                <span>Specialized Care (35%)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-white/60 backdrop-blur-xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent System Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="space-y-8">
                                {recentActivity.map((apt) => (
                                    <div key={apt.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 font-bold text-xs">
                                            New
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {apt.patientName} booked {apt.serviceName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                with {apt.doctorName} • {apt.status}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                                            {format(new Date(apt.createdAt), 'h:mm a')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

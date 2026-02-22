import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Users, Clock, CheckCircle, XCircle, Loader2, Plus, Search, FileText, ClipboardList, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { usePatientStore } from '@/store/usePatientStore';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';

// Mock Services for Doctor Booking
const SERVICES = [
    { id: '1', name: 'General Consultation', price: '$50' },
    { id: '2', name: 'Teeth Cleaning', price: '$80' },
    { id: '3', name: 'Whitening', price: '$150' },
    { id: '4', name: 'Root Canal', price: '$300' },
];

export default function DoctorDashboard() {
    const { user } = useAuthStore();
    const { appointments, subscribeToDoctorAppointments, updateAppointmentStatus, rescheduleAppointment, bookAppointment, cleanup, isLoading: isAptLoading } = useAppointmentStore();
    const { patients, fetchAllPatients, searchPatients, clearSearch, isLoading: isPatientLoading } = usePatientStore();

    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [bookingForm, setBookingForm] = useState({ serviceId: '', date: '', time: '' });

    // EMR State
    const [selectedEmrPatient, setSelectedEmrPatient] = useState<any>(null);
    const [prescriptionText, setPrescriptionText] = useState('');
    const [consultationNotes, setConsultationNotes] = useState('');

    useEffect(() => {
        if (user?.uid) {
            subscribeToDoctorAppointments(user.uid);
            fetchAllPatients(); // Preload for patient directory
        }
        return () => cleanup();
    }, [user, subscribeToDoctorAppointments, cleanup, fetchAllPatients]);

    // Apply Debounce to Patient Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm) {
                searchPatients(searchTerm);
            } else {
                clearSearch();
                fetchAllPatients();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchPatients, clearSearch, fetchAllPatients]);

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
                status: 'confirmed'
            });
            setIsBookingOpen(false);
            setBookingForm({ serviceId: '', date: '', time: '' });
            setSelectedPatient(null);
            setSearchTerm('');
            toast.success("Appointment booked successfully!");
        } catch (error) {
            toast.error("Failed to book appointment");
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleId || !bookingForm.date || !bookingForm.time) return;
        try {
            const dateObj = new Date(bookingForm.date);
            await rescheduleAppointment(rescheduleId, dateObj.toISOString(), bookingForm.time);

            setRescheduleId(null);
            setBookingForm({ serviceId: '', date: '', time: '' });
            toast.success("Appointment rescheduled!");
        } catch (error) {
            toast.error("Failed to reschedule");
        }
    }

    const savePrescription = () => {
        if (!prescriptionText.trim()) return toast.error("Prescription is empty");
        // In a real app, save to patient's EMR store
        toast.success("Prescription generated successfully!");
        setPrescriptionText('');
    }

    const saveNotes = () => {
        if (!consultationNotes.trim()) return toast.error("Notes are empty");
        // In a real app, save to patient's EMR store
        toast.success("Consultation notes saved!");
        setConsultationNotes('');
    }

    const todayAppointments = appointments.filter(a => isSameDay(new Date(a.date), new Date()));
    const pendingCount = appointments.filter(a => a.status === 'pending').length;

    const stats = [
        { title: 'Total Patients', value: patients.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Appointments Today', value: todayAppointments.length.toString(), icon: CalendarIcon, color: 'text-teal-600', bg: 'bg-teal-100' },
        { title: 'Pending Actions', value: pendingCount.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Workspace</h1>
                    <p className="text-muted-foreground">Welcome back, Dr. {user?.displayName}</p>
                </div>
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-md">
                            <Plus className="h-4 w-4 mr-2" /> New Appointment
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
                                        {isPatientLoading ? (
                                            <div className="p-2 text-xs text-center text-muted-foreground">Searching...</div>
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
                                {selectedPatient && <div className="text-xs font-medium text-teal-600 mt-1">Selected: {selectedPatient.displayName}</div>}
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
                            <Button className="w-full" onClick={handleBookPatient}>Book Appointment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="bg-white/70 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-xl`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white/50 backdrop-blur-md border p-1 border-slate-200/60 shadow-sm w-full md:w-auto h-auto grid grid-cols-3">
                    <TabsTrigger value="overview" className="py-2.5">Overview</TabsTrigger>
                    <TabsTrigger value="calendar" className="py-2.5">Calendar</TabsTrigger>
                    <TabsTrigger value="emr" className="py-2.5">Patients & EMR</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>Your schedule for today and upcoming days.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isAptLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Date / Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.length > 0 ? appointments.map((apt) => (
                                            <TableRow key={apt.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                                                            {apt.patientName?.charAt(0) || 'P'}
                                                        </div>
                                                        {apt.patientName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{apt.serviceName}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Clock className="h-3 w-3" /> {format(new Date(apt.date), 'MMM d, yyyy')} • {apt.time}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        apt.status === 'confirmed' ? "secondary" :
                                                            apt.status === 'pending' ? "outline" :
                                                                apt.status === 'completed' ? "default" : "destructive"
                                                    }
                                                        className={cn(
                                                            apt.status === 'confirmed' && "bg-green-100 text-green-800 hover:bg-green-100",
                                                            apt.status === 'pending' && "border-yellow-200 text-yellow-800 bg-yellow-50",
                                                            apt.status === 'completed' && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                                                        )}
                                                    >
                                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="ghost" className="h-8 shadow-none text-slate-500" onClick={() => setRescheduleId(apt.id!)}>
                                                            Reschedule
                                                        </Button>
                                                        {apt.status === 'pending' && (
                                                            <>
                                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 shadow-none border-green-200" onClick={() => handleStatusUpdate(apt.id!, 'confirmed')}>
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 shadow-none border-red-200" onClick={() => handleStatusUpdate(apt.id!, 'cancelled')}>
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        {apt.status === 'confirmed' && (
                                                            <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 shadow-none" onClick={() => handleStatusUpdate(apt.id!, 'completed')}>
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No appointments scheduled.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CALENDAR TAB */}
                <TabsContent value="calendar" className="space-y-4">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Schedule View</CardTitle>
                            <CardDescription>Your upcoming week at a glance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-16 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-1">Calendar Integration Active</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                                    Your appointments are displayed in the list view. Weekly drag-and-drop calendar is available in the Pro version.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EMR / PATIENTS TAB */}
                <TabsContent value="emr" className="space-y-4">
                    <div className="grid md:grid-cols-12 gap-6">
                        {/* Patient Directory */}
                        <Card className="md:col-span-4 bg-white/60 backdrop-blur-xl border-none shadow-sm h-[600px] flex flex-col">
                            <CardHeader className="pb-3 border-b border-slate-100">
                                <CardTitle className="text-lg">Patient Directory</CardTitle>
                                <div className="relative mt-2">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search patients..." className="pl-9 h-9" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-y-auto flex-1">
                                {isPatientLoading ? (
                                    <div className="p-8 text-center"><Loader2 className="animate-spin text-teal-600 mx-auto" /></div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {patients.map(p => (
                                            <div
                                                key={p.id}
                                                className={cn(
                                                    "p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-slate-50",
                                                    selectedEmrPatient?.id === p.id && "bg-teal-50 border-l-2 border-teal-600"
                                                )}
                                                onClick={() => setSelectedEmrPatient(p)}
                                            >
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-600 flex-shrink-0">
                                                    {p.displayName?.charAt(0) || 'P'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="font-medium text-sm text-slate-900 truncate">{p.displayName}</h4>
                                                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* EMR Details Workspace */}
                        <div className="md:col-span-8 flex flex-col gap-6">
                            {selectedEmrPatient ? (
                                <>
                                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{selectedEmrPatient.displayName}</CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <span>{selectedEmrPatient.email}</span> • <span>Patient ID: #{selectedEmrPatient.uid.substring(0, 6).toUpperCase()}</span>
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600">Active Patient</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-lg bg-teal-50/50 p-4 border border-teal-100 mb-6">
                                                <div className="flex items-center gap-2 text-teal-800 font-medium mb-2">
                                                    <ClipboardList className="h-4 w-4" /> Medical History (Mock Vitals)
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                                                    <div><span className="text-muted-foreground block text-xs mb-0.5">Blood Type</span>O+</div>
                                                    <div><span className="text-muted-foreground block text-xs mb-0.5">Allergies</span>Penicillin</div>
                                                    <div><span className="text-muted-foreground block text-xs mb-0.5">Last Visit</span>Feb 12, 2026</div>
                                                    <div><span className="text-muted-foreground block text-xs mb-0.5">Condition</span>Healthy</div>
                                                </div>
                                            </div>

                                            <Tabs defaultValue="notes" className="w-full">
                                                <TabsList className="grid w-full grid-cols-2 bg-slate-100/50">
                                                    <TabsTrigger value="notes">Consultation Notes</TabsTrigger>
                                                    <TabsTrigger value="prescription">Digital Prescription</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="notes" className="mt-4 space-y-4">
                                                    <Textarea
                                                        placeholder="Type diagnostic notes, observations, and treatment plans here..."
                                                        className="min-h-[150px] resize-y"
                                                        value={consultationNotes}
                                                        onChange={(e) => setConsultationNotes(e.target.value)}
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button onClick={saveNotes} className="bg-slate-900 text-white"><FileText className="h-4 w-4 mr-2" /> Save Notes</Button>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="prescription" className="mt-4 space-y-4">
                                                    <Textarea
                                                        placeholder="Rx: Amoxicillin 500mg - Take 1 PO TID x 7 days..."
                                                        className="min-h-[150px] font-mono text-sm resize-y"
                                                        value={prescriptionText}
                                                        onChange={(e) => setPrescriptionText(e.target.value)}
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button onClick={savePrescription} className="bg-teal-600 hover:bg-teal-700 text-white"><Send className="h-4 w-4 mr-2" /> Generate & Send Rx</Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>

                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm h-full flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-muted-foreground">
                                        <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-slate-800">No Patient Selected</h3>
                                        <p className="text-sm mt-1">Select a patient from the directory to view EMR and prescribe.</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Reschedule Modal (Hidden in DOM structure, triggered by state) */}
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
                        <Button className="w-full" onClick={handleReschedule}>Confirm New Time</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, TrendingUp, Loader2, Search, Stethoscope, FileText, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppointmentStore } from '@/store/useAppointmentStore';
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

export default function AdminDashboard() {
    const { appointments, subscribeToAllAppointments, cleanup, isLoading, bookAppointment } = useAppointmentStore();
    const { patients, searchPatients, clearSearch, fetchAllPatients, isLoading: isSearching } = usePatientStore();
    const { doctors, fetchDoctors } = useDoctorStore();

    // Assignment / Modal State
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [assignmentForm, setAssignmentForm] = useState({ doctorId: '', serviceId: '', date: '', time: '' });

    // CRM State
    const [crmSearch, setCrmSearch] = useState('');

    // Billing State
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        subscribeToAllAppointments();
        fetchDoctors();
        fetchAllPatients();
        return () => cleanup();
    }, [subscribeToAllAppointments, cleanup, fetchDoctors, fetchAllPatients]);

    // Generate Mock Invoices when appointments load
    useEffect(() => {
        if (appointments.length > 0) {
            setInvoices(prev => {
                // Only generate if empty to prevent infinite loops
                if (prev.length > 0) return prev;

                return appointments
                    .filter(a => a.status === 'completed' || a.status === 'confirmed')
                    .map((a, i) => ({
                        id: `INV-2026-${i + 100}`,
                        patientName: a.patientName,
                        amount: a.price,
                        date: a.date,
                        status: Math.random() > 0.3 ? 'Paid' : 'Pending',
                        service: a.serviceName
                    }));
            });
        }
    }, [appointments]);

    // Search Debounce (Assignment modal)
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

    const handleGenerateInvoice = () => {
        toast.success("Invoice generated successfully & emailed to patient.");
    }

    // Calculate Real Stats
    const totalRevenue = appointments
        .filter(a => a.status === 'completed' || a.status === 'confirmed')
        .reduce((acc, curr) => acc + (parseFloat(curr.price.replace('$', '')) || 0), 0);

    const activePatientsCount = new Set(appointments.map(a => a.patientId)).size;
    const today = new Date().toDateString();
    const appointmentsToday = appointments.filter(a => new Date(a.date).toDateString() === today).length;

    const filteredCrmPatients = patients.filter(p =>
        p.displayName?.toLowerCase().includes(crmSearch.toLowerCase()) ||
        p.email?.toLowerCase().includes(crmSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clinic Administration</h1>
                    <p className="text-muted-foreground">Manage operations, patients, and billing.</p>
                </div>

                <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                            <Stethoscope className="h-4 w-4 mr-2" /> Assign Appointment
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
                                        {isSearching ? <div className="p-2 text-xs text-center text-muted-foreground">Searching...</div> :
                                            patients.length > 0 ? patients.map(p => (
                                                <div key={p.id} className={cn("p-2 text-sm cursor-pointer hover:bg-purple-50", selectedPatient?.id === p.id && "bg-purple-100 font-medium")}
                                                    onClick={() => { setSelectedPatient(p); setSearchTerm(p.displayName || p.email); }}>
                                                    {p.displayName} <span className="text-xs text-muted-foreground">({p.email})</span>
                                                </div>
                                            )) : <div className="p-2 text-xs text-center text-muted-foreground">No patients found.</div>}
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
                                            <SelectItem key={d.uid} value={d.uid}>{d.displayName || d.email} - {d.specialty}</SelectItem>
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
                            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleAssign}>Confirm Assignment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/70 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Projected Revenue</CardTitle>
                        <div className="bg-green-100 p-2 rounded-xl"><DollarSign className="h-5 w-5 text-green-600" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">${totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/70 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Patients</CardTitle>
                        <div className="bg-blue-100 p-2 rounded-xl"><Users className="h-5 w-5 text-blue-600" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">{activePatientsCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/70 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Appointments</CardTitle>
                        <div className="bg-purple-100 p-2 rounded-xl"><Activity className="h-5 w-5 text-purple-600" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">{appointments.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/70 backdrop-blur-xl border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Today's Volume</CardTitle>
                        <div className="bg-orange-100 p-2 rounded-xl"><TrendingUp className="h-5 w-5 text-orange-600" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">+{appointmentsToday}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white/50 backdrop-blur-md border p-1 border-slate-200/60 shadow-sm w-full md:w-auto h-auto grid grid-cols-3">
                    <TabsTrigger value="overview" className="py-2.5">Schedule Overview</TabsTrigger>
                    <TabsTrigger value="crm" className="py-2.5">Patient Directory</TabsTrigger>
                    <TabsTrigger value="billing" className="py-2.5">Billing & Invoicing</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Master Schedule</CardTitle>
                            <CardDescription>All appointments across all doctors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Doctor</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Date / Time</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {appointments.length > 0 ? appointments.map((apt) => (
                                            <TableRow key={apt.id}>
                                                <TableCell className="font-medium">{apt.patientName}</TableCell>
                                                <TableCell className="text-slate-600">{apt.doctorName}</TableCell>
                                                <TableCell>{apt.serviceName}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-slate-600">{format(new Date(apt.date), 'MMM d, yyyy')} • {apt.time}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(
                                                        apt.status === 'confirmed' && "border-green-200 text-green-800 bg-green-50",
                                                        apt.status === 'pending' && "border-yellow-200 text-yellow-800 bg-yellow-50",
                                                        apt.status === 'completed' && "border-blue-200 text-blue-800 bg-blue-50",
                                                    )}>
                                                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No appointments booked.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CRM TAB */}
                <TabsContent value="crm">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Patient CRM</CardTitle>
                                <CardDescription>Manage patient records and access.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search directory..."
                                    className="pl-9 h-9"
                                    value={crmSearch}
                                    onChange={(e) => setCrmSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email / UID</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCrmPatients.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">
                                                        {p.displayName?.charAt(0) || 'P'}
                                                    </div>
                                                    {p.displayName}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600">{p.email}</TableCell>
                                            <TableCell><Badge variant="outline" className="bg-slate-50">{p.role}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">View Record</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Billing & Invoices</CardTitle>
                                <CardDescription>Generate and manage patient invoices.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleGenerateInvoice}>
                                <Plus className="h-4 w-4 mr-2" /> Generate Manual Invoice
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {invoices.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice ID</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Download</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-medium font-mono text-slate-500">{inv.id}</TableCell>
                                                <TableCell className="font-medium">{inv.patientName}</TableCell>
                                                <TableCell className="text-slate-600">{inv.service}</TableCell>
                                                <TableCell className="font-medium text-slate-700">{inv.amount}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.status === 'Paid' ? 'secondary' : 'outline'} className={inv.status === 'Paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-slate-50 text-slate-600'}>
                                                        {inv.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <Download className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600 font-medium">No invoices generated yet.</p>
                                    <p className="text-sm text-slate-500 mt-1">Confirmed appointments will automatically appear here to be billed.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

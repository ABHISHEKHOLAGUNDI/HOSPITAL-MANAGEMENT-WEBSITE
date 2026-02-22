import { useEffect, useState } from 'react';
import { Users, DollarSign, Activity, TrendingUp, Loader2, Search, Stethoscope, FileText, Download, Plus, Package, AlertTriangle } from 'lucide-react';
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
import { useInventoryStore } from '@/store/useInventoryStore';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock Services
const SERVICES = [
    { id: '1', name: 'General Consultation', price: '$50' },
    { id: '2', name: 'Teeth Cleaning', price: '$80' },
    { id: '3', name: 'Whitening', price: '$150' },
    { id: '4', name: 'Root Canal', price: '$300' },
];

export default function AdminDashboard() {
    const { appointments, subscribeToAllAppointments, cleanup, isLoading, bookAppointment } = useAppointmentStore();
    const { patients, searchResults, searchPatients, clearSearch, fetchAllPatients, isLoading: isSearching } = usePatientStore();
    const { doctors, fetchDoctors } = useDoctorStore();
    const { items: inventoryItems, updateItem: updateInventoryItem } = useInventoryStore();

    // URL Sync State
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'overview';

    // Assignment / Modal State
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [assignmentForm, setAssignmentForm] = useState({ doctorId: '', serviceId: '', date: '', time: '' });

    // Walk-In State
    const [isWalkInOpen, setIsWalkInOpen] = useState(false);
    const [walkInForm, setWalkInForm] = useState({ patientName: '', phone: '', doctorId: '', serviceId: '' });

    // CRM State
    const [crmSearch, setCrmSearch] = useState('');

    // Billing State
    const { invoices, addInvoice, setInvoices } = useInvoiceStore();
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        patientId: '',
        serviceId: '',
        selectedItems: [] as { id: string, name: string, price: number, quantity: number }[],
        taxRate: 10,
        discount: 0
    });

    useEffect(() => {
        subscribeToAllAppointments();
        fetchDoctors();
        fetchAllPatients();
        return () => cleanup();
    }, [subscribeToAllAppointments, cleanup, fetchDoctors, fetchAllPatients]);

    // Generate Mock Invoices when appointments load
    useEffect(() => {
        if (appointments.length > 0 && invoices.length === 0) {
            const generated = appointments
                .filter(a => a.status === 'completed' || a.status === 'confirmed')
                .map((a, i) => ({
                    id: `INV-2026-${i + 100}`,
                    patientName: a.patientName,
                    amount: a.price,
                    date: a.date,
                    status: (Math.random() > 0.3 ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
                    service: a.serviceName
                }));
            if (generated.length > 0) setInvoices(generated);
        }
    }, [appointments, setInvoices, invoices.length]);

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

    const handleWalkIn = async () => {
        if (!walkInForm.patientName || !walkInForm.doctorId || !walkInForm.serviceId) {
            toast.error("Please fill required walk-in fields");
            return;
        }

        const service = SERVICES.find(s => s.id === walkInForm.serviceId);
        const doctor = doctors.find(d => d.uid === walkInForm.doctorId);
        const now = new Date();

        try {
            await bookAppointment({
                patientId: `walkin-${crypto.randomUUID()}`,
                patientName: `${walkInForm.patientName} (Walk-In)`,
                doctorId: doctor!.uid,
                doctorName: doctor!.displayName || 'Dr. ' + doctor!.email,
                serviceId: service!.id,
                serviceName: service!.name,
                price: service!.price,
                date: now.toISOString(),
                time: format(now, 'HH:mm'), // Current time
                status: 'pending' // Wait Queue
            });

            setIsWalkInOpen(false);
            setWalkInForm({ patientName: '', phone: '', doctorId: '', serviceId: '' });
            toast.success(`Walk-In added to ${doctor?.displayName}'s queue`);
        } catch (error) {
            toast.error("Failed to add walk-in");
        }
    };

    const handleAddInvoiceItem = (itemId: string) => {
        const item = inventoryItems.find(i => i.id === itemId);
        if (!item) return;

        const existing = invoiceForm.selectedItems.find(i => i.id === itemId);
        if (existing) {
            setInvoiceForm({ ...invoiceForm, selectedItems: invoiceForm.selectedItems.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
            setInvoiceForm({ ...invoiceForm, selectedItems: [...invoiceForm.selectedItems, { id: item.id, name: item.name, price: item.unitPrice, quantity: 1 }] });
        }
    };

    const calculateInvoiceTotal = () => {
        const servicePrice = SERVICES.find(s => s.id === invoiceForm.serviceId)?.price.replace('$', '') || '0';
        const itemsTotal = invoiceForm.selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const subtotal = parseFloat(servicePrice) + itemsTotal;
        const tax = subtotal * (invoiceForm.taxRate / 100);
        return Math.max(0, subtotal + tax - invoiceForm.discount).toFixed(2);
    };

    const handleGenerateInvoice = () => {
        if (!invoiceForm.patientId || !invoiceForm.serviceId) {
            return toast.error("Please select a patient and service");
        }
        const patient = patients.find(p => p.uid === invoiceForm.patientId || p.id === invoiceForm.patientId);
        const service = SERVICES.find(s => s.id === invoiceForm.serviceId);
        const total = calculateInvoiceTotal();

        const newInvoice = {
            id: `INV-${Date.now().toString().slice(-6)}`,
            patientName: patient?.displayName || 'Unknown',
            amount: `$${total}`,
            date: new Date().toISOString(),
            status: 'Pending' as const,
            service: service?.name
        };

        addInvoice(newInvoice);
        setIsInvoiceOpen(false);
        setInvoiceForm({ patientId: '', serviceId: '', selectedItems: [], taxRate: 10, discount: 0 });
        toast.success(`Generated itemized invoice for ${newInvoice.patientName}`);
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            toast.error("No data to export");
            return;
        }
        // Very basic CSV exporter, omits nested objects but works for flat stores
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${filename}.csv`);
    };

    // Chart Data Preparation
    const revenueByService = appointments
        .filter(a => a.status === 'completed' || a.status === 'confirmed')
        .reduce((acc: any, curr) => {
            const service = curr.serviceName;
            const price = parseFloat(curr.price.replace('$', '')) || 0;
            if (!acc[service]) acc[service] = 0;
            acc[service] += price;
            return acc;
        }, {});

    const pieData = Object.keys(revenueByService).map(key => ({
        name: key,
        value: revenueByService[key]
    }));

    const COLORS = ['#0F766E', '#8B5CF6', '#F59E0B', '#3B82F6', '#EF4444'];

    const appointmentsByMonth = appointments.reduce((acc: any, curr) => {
        const month = format(new Date(curr.date), 'MMM yy');
        if (!acc[month]) acc[month] = { name: month, appointments: 0, revenue: 0 };
        acc[month].appointments += 1;
        if (curr.status === 'completed' || curr.status === 'confirmed') {
            acc[month].revenue += parseFloat(curr.price.replace('$', '')) || 0;
        }
        return acc;
    }, {});
    const barData = Object.values(appointmentsByMonth);

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

    // Live Queue Setup
    const liveQueue = appointments.filter(a => new Date(a.date).toDateString() === today && (a.status === 'pending' || a.status === 'confirmed'));

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
                                            searchResults.length > 0 ? searchResults.map(p => (
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

                <Dialog open={isWalkInOpen} onOpenChange={setIsWalkInOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                            <Users className="h-4 w-4 mr-2" /> Quick Walk-In
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Register Walk-In Patient</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Patient Full Name</Label>
                                <Input placeholder="John Doe" value={walkInForm.patientName} onChange={(e) => setWalkInForm({ ...walkInForm, patientName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number (Optional)</Label>
                                <Input placeholder="555-0199" value={walkInForm.phone} onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Assign to Doctor</Label>
                                <Select onValueChange={(val) => setWalkInForm({ ...walkInForm, doctorId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Doctor..." /></SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(d => <SelectItem key={d.uid} value={d.uid}>{d.displayName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Service Required</Label>
                                <Select onValueChange={(val) => setWalkInForm({ ...walkInForm, serviceId: val })}>
                                    <SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                    <SelectContent>
                                        {SERVICES.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={handleWalkIn}>Add to Live Queue</Button>
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

            <Tabs value={currentTab} onValueChange={(v) => setSearchParams(prev => { prev.set('tab', v); return prev; }, { replace: true })} className="space-y-4">
                <TabsList className="bg-card backdrop-blur-md border p-1 border-slate-200/60 shadow-sm w-full md:w-auto h-auto grid grid-cols-2 lg:grid-cols-5">
                    <TabsTrigger value="overview" className="py-2.5">Schedule Overview</TabsTrigger>
                    <TabsTrigger value="analytics" className="py-2.5">Analytics</TabsTrigger>
                    <TabsTrigger value="crm" className="py-2.5">Patient CRM</TabsTrigger>
                    <TabsTrigger value="billing" className="py-2.5">Billing</TabsTrigger>
                    <TabsTrigger value="inventory" className="py-2.5">Inventory</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Live Queue Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                        {liveQueue.slice(0, 3).map((apt, idx) => (
                            <Card key={apt.id || idx} className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-sm animate-in fade-in zoom-in duration-300">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div>
                                        <Badge variant="outline" className="bg-purple-100 text-purple-800 mb-2 border-transparent">Next {idx + 1}</Badge>
                                        <h3 className="font-semibold text-slate-800">{apt.patientName}</h3>
                                        <p className="text-xs text-slate-500">{apt.serviceName} • {apt.time}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-700">{apt.doctorName}</div>
                                        <div className="flex gap-2 mt-2">
                                            {apt.status === 'pending' && <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">Waiting</Badge>}
                                            {apt.status === 'confirmed' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">In Clinic</Badge>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {liveQueue.length === 0 && (
                            <div className="col-span-full text-center py-6 border border-dashed rounded-lg bg-slate-50 text-slate-500">
                                No active patients in the live queue right now.
                            </div>
                        )}
                    </div>

                    <Card className="bg-card backdrop-blur-xl border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Master Schedule</CardTitle>
                                <CardDescription>All appointments across all doctors.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => exportToCSV(appointments, 'appointments')}>
                                <Download className="h-4 w-4 mr-2" /> Export CSV
                            </Button>
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

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-card backdrop-blur-xl border shadow-sm">
                            <CardHeader>
                                <CardTitle>Revenue Trends</CardTitle>
                                <CardDescription>Monthly revenue from completed/confirmed appointments.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Revenue ($)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="bg-card backdrop-blur-xl border shadow-sm">
                            <CardHeader>
                                <CardTitle>Revenue by Specialty</CardTitle>
                                <CardDescription>Distribution of income across services.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* CRM TAB */}
                <TabsContent value="crm">
                    <Card className="bg-card backdrop-blur-xl border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Patient CRM</CardTitle>
                                <CardDescription>Manage patient records and access.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search directory..."
                                    className="pl-9 h-9 w-64"
                                    value={crmSearch}
                                    onChange={(e) => setCrmSearch(e.target.value)}
                                />
                                <Button size="sm" variant="outline" onClick={() => exportToCSV(patients, 'patients_crm')}>
                                    <Download className="h-4 w-4 mr-2" /> Export
                                </Button>
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
                    <Card className="bg-card backdrop-blur-xl border shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Billing & Invoices</CardTitle>
                                <CardDescription>Generate and manage patient invoices.</CardDescription>
                            </div>
                            <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                                        <Plus className="h-4 w-4 mr-2" /> New Invoice Builder
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>Create Itemized Invoice</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4 overflow-y-auto flex-1 pr-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Patient (Bill To)</Label>
                                                <Select onValueChange={(val) => setInvoiceForm({ ...invoiceForm, patientId: val })}>
                                                    <SelectTrigger><SelectValue placeholder="Select Patient..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.displayName} {p.insuranceProvider ? `(${p.insuranceProvider})` : ''}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Primary Service</Label>
                                                <Select onValueChange={(val) => setInvoiceForm({ ...invoiceForm, serviceId: val })}>
                                                    <SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {SERVICES.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.price})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t pt-4">
                                            <Label>Add Inventory Items (Medicines, Supplies)</Label>
                                            <div className="flex gap-2">
                                                <Select onValueChange={handleAddInvoiceItem}>
                                                    <SelectTrigger><SelectValue placeholder="Select Item to add to bill" /></SelectTrigger>
                                                    <SelectContent>
                                                        {inventoryItems.map(item => <SelectItem key={item.id} value={item.id}>{item.name} - ${item.unitPrice}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {invoiceForm.selectedItems.length > 0 && (
                                                <div className="border rounded-md mt-2">
                                                    <Table>
                                                        <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Cost</TableHead></TableRow></TableHeader>
                                                        <TableBody>
                                                            {invoiceForm.selectedItems.map(item => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell className="py-2 text-sm">{item.name}</TableCell>
                                                                    <TableCell className="py-2"><Badge variant="secondary">x{item.quantity}</Badge></TableCell>
                                                                    <TableCell className="py-2">${item.price * item.quantity}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                            <div className="space-y-2">
                                                <Label>Tax Rate (%)</Label>
                                                <Input type="number" min="0" value={invoiceForm.taxRate} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: Number(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Discount ($)</Label>
                                                <Input type="number" min="0" value={invoiceForm.discount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter className="border-t pt-4 sm:justify-between items-center">
                                        <div className="text-xl font-bold">Total: ${calculateInvoiceTotal()}</div>
                                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleGenerateInvoice}>Generate Final Invoice</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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

                {/* INVENTORY TAB */}
                <TabsContent value="inventory">
                    <Card className="bg-card backdrop-blur-xl border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pharmacy & Inventory</CardTitle>
                                <CardDescription>Manage clinic medicines and supplies stock.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => exportToCSV(inventoryItems, 'inventory')}>
                                <Download className="h-4 w-4 mr-2" /> Export Inventory
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Stock Level</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventoryItems.map((item) => {
                                        const isLow = item.stockLevel <= item.threshold;
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-slate-400" />
                                                        {item.name}
                                                        {isLow && <Badge variant="destructive" className="ml-2 text-[10px] h-5 px-1.5"><AlertTriangle className="h-3 w-3 mr-1" /> Low</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-50">{item.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn("font-medium", isLow ? "text-red-600" : "text-slate-700")}>
                                                        {item.stockLevel} units
                                                    </span>
                                                </TableCell>
                                                <TableCell>${item.unitPrice}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8"
                                                        onClick={() => {
                                                            updateInventoryItem(item.id, { stockLevel: item.stockLevel + 50 });
                                                            toast.success(`Restocked 50 units of ${item.name}`);
                                                        }}
                                                    >
                                                        + Restock
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

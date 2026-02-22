import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, Plus, Activity, Download, Pill, FileSignature, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PatientDashboard = () => {
    const { user } = useAuthStore();
    const { appointments, subscribeToPatientAppointments, cleanup } = useAppointmentStore();

    useEffect(() => {
        if (user?.uid) {
            subscribeToPatientAppointments(user.uid);
        }
        return () => cleanup();
    }, [user, subscribeToPatientAppointments, cleanup]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const nextAppointment = appointments.find(a => new Date(a.date) > new Date() && a.status !== 'cancelled');
    const pastAppointments = appointments.filter(a => new Date(a.date) <= new Date() || a.status === 'completed' || a.status === 'cancelled').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Generate Mock Records based on past completed appointments
    const completedAppointments = pastAppointments.filter(a => a.status === 'completed' || a.status === 'confirmed');
    const mockPrescriptions = completedAppointments.map((a, i) => ({
        id: `RX-${2026}${i}`,
        date: a.date,
        doctor: a.doctorName,
        medication: "Amoxicillin 500mg, Ibuprofen 400mg"
    }));

    const mockInvoices = completedAppointments.map((a, i) => ({
        id: `INV-${2026}${i}`,
        date: a.date,
        service: a.serviceName,
        amount: a.price,
        status: "Paid"
    }));

    const handleDownload = (type: string) => {
        toast.success(`Downloading ${type}...`);
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Banner */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-600 p-8 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.displayName || 'Patient'}!</h1>
                        <p className="text-teal-100 max-w-xl">
                            {nextAppointment
                                ? `You have an upcoming appointment on ${format(new Date(nextAppointment.date), 'MMMM do')}.`
                                : "You have no upcoming appointments scheduled."}
                        </p>
                    </div>
                    <Button asChild className="bg-white text-teal-600 hover:bg-white/90 shadow-xl border-none">
                        <Link to="/patient/book">
                            <Plus className="mr-2 h-4 w-4" /> Book New Appointment
                        </Link>
                    </Button>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-black/10 blur-2xl" />
            </motion.div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white/50 backdrop-blur-md border p-1 border-slate-200/60 shadow-sm w-full md:w-auto h-auto grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="overview" className="py-2.5">Overview</TabsTrigger>
                    <TabsTrigger value="history" className="py-2.5">History</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="py-2.5">Prescriptions</TabsTrigger>
                    <TabsTrigger value="billing" className="py-2.5">Billing</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Upcoming Appointment Card */}
                        <motion.div variants={itemVariants} className="md:col-span-2">
                            <Card className="h-full border-none shadow-md bg-white/60 backdrop-blur-xl hover:shadow-lg transition-all">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">Next Appointment</CardTitle>
                                    <Calendar className="h-5 w-5 text-teal-600" />
                                </CardHeader>
                                <CardContent>
                                    {nextAppointment ? (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
                                            <div className="h-16 w-16 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl flex-col">
                                                {format(new Date(nextAppointment.date), 'd')}
                                                <span className="text-xs font-normal ml-0.5">{format(new Date(nextAppointment.date), 'MMM')}</span>
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <h3 className="font-semibold text-lg">{nextAppointment.doctorName}</h3>
                                                <p className="text-sm text-muted-foreground">{nextAppointment.serviceName}</p>
                                                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mt-1">
                                                    <Clock className="h-3 w-3" /> {nextAppointment.time}
                                                </div>
                                                <span className={`inline-block px-2 py-0.5 mt-2 rounded-full text-xs font-medium ${nextAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    nextAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {nextAppointment.status.charAt(0).toUpperCase() + nextAppointment.status.slice(1)}
                                                </span>
                                            </div>
                                            <Button variant="outline" size="sm">Reschedule</Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                            <p>No upcoming appointments.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Health Score / Quick Stats */}
                        <motion.div variants={itemVariants}>
                            <Card className="h-full border-none shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
                                <CardHeader className="relative z-10 pb-2">
                                    <CardTitle className="text-lg font-medium text-white/90">Health Score</CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="mt-4 flex flex-col items-center">
                                        <div className="relative h-24 w-24 flex items-center justify-center">
                                            <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                <path className="text-white/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                <path className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            </svg>
                                            <span className="absolute text-2xl font-bold">92</span>
                                        </div>
                                        <p className="text-sm text-white/80 mt-2">Excellent Condition</p>
                                    </div>
                                </CardContent>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                            </Card>
                        </motion.div>
                    </div>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Appointment History</CardTitle>
                            <CardDescription>Review your past visits and statuses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastAppointments.length > 0 ? pastAppointments.map((apt) => (
                                        <TableRow key={apt.id}>
                                            <TableCell className="font-medium">{format(new Date(apt.date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="text-slate-600">{apt.doctorName}</TableCell>
                                            <TableCell>{apt.serviceName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(
                                                    apt.status === 'completed' && "bg-blue-100 text-blue-800 border-blue-200",
                                                    apt.status === 'cancelled' && "bg-red-100 text-red-800 border-red-200",
                                                    apt.status === 'confirmed' && "bg-green-100 text-green-800 border-green-200"
                                                )}>
                                                    {apt.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No past appointments found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRESCRIPTIONS TAB */}
                <TabsContent value="prescriptions">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Digital Prescriptions</CardTitle>
                            <CardDescription>Access and download your medication scripts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {mockPrescriptions.length > 0 ? mockPrescriptions.map(rx => (
                                    <Card key={rx.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 flex items-start gap-4">
                                            <div className="bg-purple-100 p-3 rounded-xl">
                                                <Pill className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-slate-800">{rx.id}</h4>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(rx.date), 'MMM d, yyyy')}</span>
                                                </div>
                                                <p className="text-sm text-slate-600">Prescribed by {rx.doctor}</p>
                                                <p className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded truncate mt-2">{rx.medication}</p>
                                                <Button size="sm" variant="outline" className="w-full mt-3 text-purple-600 hover:text-purple-700" onClick={() => handleDownload('Prescription')}>
                                                    <FileSignature className="h-4 w-4 mr-2" /> Download e-Rx
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="col-span-2 text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <Pill className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p className="text-muted-foreground font-medium">No active prescriptions.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BILLING TAB */}
                <TabsContent value="billing">
                    <Card className="bg-white/60 backdrop-blur-xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Billing & Invoices</CardTitle>
                            <CardDescription>View your payment history and download receipts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockInvoices.length > 0 ? mockInvoices.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell className="font-medium font-mono text-slate-500">{inv.id}</TableCell>
                                            <TableCell>{format(new Date(inv.date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{inv.service}</TableCell>
                                            <TableCell className="font-semibold">{inv.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    {inv.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => handleDownload('Invoice')}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <Receipt className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                                                <span className="text-muted-foreground">No invoices history found.</span>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default PatientDashboard;

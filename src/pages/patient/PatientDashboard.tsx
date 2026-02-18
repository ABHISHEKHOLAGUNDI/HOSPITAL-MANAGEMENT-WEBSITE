import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, Plus, Activity, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PatientDashboard = () => {
    const { user } = useAuthStore();
    const { appointments, subscribeToPatientAppointments, cleanup, isLoading } = useAppointmentStore();

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
    const recentAppointments = appointments.filter(a => new Date(a.date) <= new Date() && a.status === 'completed').slice(0, 3);

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

            {/* Stats / Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upcoming Appointment Card */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="h-full border-none shadow-md bg-white/60 backdrop-blur-xl hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">Next Appointment</CardTitle>
                            <Calendar className="h-5 w-5 text-primary" />
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
                                <div className="text-center py-8 text-muted-foreground">
                                    No upcoming appointments.
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

            {/* Recent History & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Visits */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full border-none shadow-sm bg-white/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent History</CardTitle>
                            <CardDescription>Your last 3 visits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentAppointments.length > 0 ? recentAppointments.map((apt) => (
                                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{apt.serviceName}</p>
                                            <p className="text-xs text-muted-foreground">{apt.doctorName} • {format(new Date(apt.date), 'MMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">No recent history.</div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full border-none shadow-sm bg-white/60 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Access</CardTitle>
                            <CardDescription>Manage your profile and records</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group">
                                <FileText className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                Download Reports
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group">
                                <div className="relative">
                                    <Activity className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                </div>
                                View Prescriptions
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group">
                                <Star className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                Rate Visit
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group">
                                <Calendar className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                                Full Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PatientDashboard;

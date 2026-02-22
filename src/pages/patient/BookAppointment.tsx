import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, User, Stethoscope } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock Data
const SERVICES = [
    { id: '1', name: 'General Consultation', duration: '30 min', price: '$50', icon: Stethoscope },
    { id: '2', name: 'Teeth Cleaning', duration: '45 min', price: '$80', icon: CheckCircle },
    { id: '3', name: 'Whitening', duration: '60 min', price: '$150', icon: User },
    { id: '4', name: 'Root Canal', duration: '90 min', price: '$300', icon: ActivityIcon },
];

const DOCTORS = [
    { id: 'd1', name: 'Dr. Sarah Johnson', specialty: 'General Dentist', image: 'https://i.pravatar.cc/150?u=d1' },
    { id: 'd2', name: 'Dr. Michael Chen', specialty: 'Orthodontist', image: 'https://i.pravatar.cc/150?u=d2' },
    { id: 'd3', name: 'Dr. Emily Davis', specialty: 'Endodontist', image: 'https://i.pravatar.cc/150?u=d3' },
];

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
];

function ActivityIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}

const steps = ['Service', 'Doctor', 'Date & Time', 'Confirm'];

const BookAppointment = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        service: null as typeof SERVICES[0] | null,
        doctor: null as typeof DOCTORS[0] | null,
        date: startOfToday(),
        time: null as string | null,
    });

    const { user } = useAuthStore();
    const { bookAppointment, isLoading } = useAppointmentStore();
    const navigate = useNavigate();

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const handleBook = async () => {
        if (!user || !formData.service || !formData.doctor || !formData.time) {
            console.error("Validation failed:", { user, service: formData.service, doctor: formData.doctor, time: formData.time });
            return;
        }

        try {
            await bookAppointment({
                patientId: user.uid,
                patientName: user.displayName || 'Unknown Patient',
                doctorId: formData.doctor.id,
                doctorName: formData.doctor.name,
                serviceId: formData.service.id,
                serviceName: formData.service.name,
                date: formData.date.toISOString(),
                time: formData.time!,
                price: formData.service.price,
                status: 'pending'
            });

            toast.success('Appointment Booked Successfully!');
            navigate('/patient');
        } catch (error) {
            console.error("Booking error:", error);
            toast.error('Failed to book appointment. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
                <p className="text-muted-foreground mt-2">Follow the steps to schedule your visit.</p>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                <div className="flex justify-between">
                    {steps.map((step, index) => (
                        <div key={step} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border-2",
                                    index <= currentStep
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "bg-white border-slate-300 text-slate-500"
                                )}
                            >
                                {index + 1}
                            </div>
                            <span className={cn("text-xs font-medium", index <= currentStep ? "text-primary" : "text-muted-foreground")}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="border-none shadow-lg bg-white/70 backdrop-blur-xl min-h-[400px]">
                <CardContent className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {/* Step 1: Select Service */}
                            {currentStep === 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {SERVICES.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => setFormData({ ...formData, service })}
                                            className={cn(
                                                "flex items-center p-4 rounded-xl border-2 transition-all hover:border-primary/50 text-left",
                                                formData.service?.id === service.id
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-transparent bg-white shadow-sm hover:shadow-md"
                                            )}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-4">
                                                <service.icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{service.name}</h3>
                                                <p className="text-sm text-muted-foreground">{service.duration}</p>
                                            </div>
                                            <p className="font-bold text-primary">{service.price}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Select Doctor */}
                            {currentStep === 1 && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {DOCTORS.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            onClick={() => setFormData({ ...formData, doctor })}
                                            className={cn(
                                                "flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:border-primary/50 text-center space-y-4",
                                                formData.doctor?.id === doctor.id
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-transparent bg-white shadow-sm hover:shadow-md"
                                            )}
                                        >
                                            <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-full object-cover shadow-md" />
                                            <div>
                                                <h3 className="font-semibold">{doctor.name}</h3>
                                                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Date & Time */}
                            {currentStep === 2 && (
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <Label className="mb-4 block">Select Date</Label>
                                        {/* Simple Date Picker Mockup */}
                                        <div className="grid grid-cols-4 gap-2">
                                            {[0, 1, 2, 3, 4, 5, 6, 7].map((offset) => {
                                                const date = addDays(new Date(), offset);
                                                const isSelected = formData.date.toDateString() === date.toDateString();
                                                return (
                                                    <button
                                                        key={offset}
                                                        onClick={() => setFormData({ ...formData, date })}
                                                        className={cn(
                                                            "p-2 rounded-lg text-center border transition-all",
                                                            isSelected ? "bg-primary text-white border-primary" : "bg-white hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className="text-xs opacity-70">{format(date, 'EEE')}</div>
                                                        <div className="font-bold text-lg">{format(date, 'd')}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-4 block">Select Time Slot</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {TIME_SLOTS.map((slot) => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setFormData({ ...formData, time: slot })}
                                                    className={cn(
                                                        "p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2",
                                                        formData.time === slot
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-white hover:border-primary/50 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirm */}
                            {currentStep === 3 && (
                                <div className="max-w-md mx-auto space-y-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">Booking Summary</h3>

                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Service</span>
                                            <span className="font-medium">{formData.service?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Doctor</span>
                                            <span className="font-medium">{formData.doctor?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Date & Time</span>
                                            <span className="font-medium">{format(formData.date, 'MMM d, yyyy')} at {formData.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="font-semibold">Total Price</span>
                                            <span className="font-bold text-xl text-primary">{formData.service?.price}</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-700">
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                        <p>By confirming, you agree to our cancellation policy. You will receive a confirmation email shortly.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="w-32"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {currentStep === steps.length - 1 ? (
                    <Button
                        className="w-32 bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg"
                        onClick={handleBook}
                        disabled={!formData.service || !formData.doctor || !formData.time || isLoading}
                    >
                        {isLoading ? 'Booking...' : (
                            <>Confirm <CheckCircle className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                ) : (
                    <Button
                        className="w-32"
                        onClick={nextStep}
                        disabled={
                            (currentStep === 0 && !formData.service) ||
                            (currentStep === 1 && !formData.doctor) ||
                            (currentStep === 2 && !formData.time)
                        }
                    >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BookAppointment;

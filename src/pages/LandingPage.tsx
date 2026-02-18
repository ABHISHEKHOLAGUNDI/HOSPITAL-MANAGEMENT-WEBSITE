import { ArrowRight, CheckCircle, Shield, Star, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

const LandingPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Accepting New Patients
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                Advanced Care for Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
                                    Future Smile
                                </span>
                            </motion.h1>

                            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-lg">
                                Experience the next generation of dental healthcare. AI-powered diagnostics, painless treatments, and a patient portal designed for you.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button size="lg" className="w-full sm:w-auto h-12 text-base shadow-teal-500/25 shadow-lg">
                                    Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 text-base">
                                    View our Services
                                </Button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-8 flex items-center gap-8 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-slate-200" />
                                        ))}
                                    </div>
                                    <span>2k+ Happy Patients</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium text-foreground">4.9</span>
                                    <span>(500+ Reviews)</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Hero Image / Interaction Area */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative lg:h-[600px] w-full flex items-center justify-center"
                        >
                            {/* Abstract decorative elements simulating a 3D interface */}
                            <div className="relative w-full max-w-md aspect-square">
                                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 rounded-[2rem] transform rotate-3 blur-sm" />
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl overflow-hidden p-6 flex flex-col items-center justify-center text-center">
                                    <Shield className="h-16 w-16 text-primary mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Smart Dental Shield</h3>
                                    <p className="text-slate-500">AI-driven cavity protection monitoring active 24/7.</p>

                                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                                            <p className="text-2xl font-bold text-primary">99%</p>
                                            <p className="text-xs text-slate-500">Accuracy</p>
                                        </div>
                                        <div className="bg-white/50 p-4 rounded-xl border border-white/60">
                                            <p className="text-2xl font-bold text-primary">0.1s</p>
                                            <p className="text-xs text-slate-500">Scan Time</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:block"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Appointment Confirmed</p>
                                            <p className="text-xs text-slate-500">Today, 2:00 PM</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:block"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Next Checkup</p>
                                            <p className="text-xs text-slate-500">In 2 weeks</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-50/50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose DentalCare<span className="text-primary">Plus</span>?</h2>
                        <p className="text-muted-foreground">We combine cutting-edge technology with compassionate care to deliver the best dental experience.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="hover:shadow-lg transition-all border-none shadow-sm h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Advanced Security</CardTitle>
                                <CardDescription>Your health data is encrypted and protected with enterprise-grade security.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="hover:shadow-lg transition-all border-none shadow-sm h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Instant Booking</CardTitle>
                                <CardDescription>Book appointments in seconds with our smart scheduling system. No phone calls needed.</CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="hover:shadow-lg transition-all border-none shadow-sm h-full">
                            <CardHeader>
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Expert Team</CardTitle>
                                <CardDescription>Our board-certified specialists use the latest techniques for painless treatments.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer (Simplified) */}
            <footer className="bg-slate-900 text-slate-200 py-12">
                <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-primary p-1 rounded">
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">DentalCarePlus</span>
                        </div>
                        <p className="text-sm text-slate-400">Next-gen dental care for the modern family.</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Services</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>Cosmetic Dentistry</li>
                            <li>Implants</li>
                            <li>Orthodontics</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li>About Us</li>
                            <li>Careers</li>
                            <li>Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Newsletter</h4>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Enter email" className="bg-slate-800 border-none rounded px-3 py-2 text-sm w-full" />
                            <Button size="sm">Subscribe</Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

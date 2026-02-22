import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import PatientDashboard from '@/pages/patient/PatientDashboard'
import BookAppointment from '@/pages/patient/BookAppointment'
import DoctorDashboard from '@/pages/doctor/DoctorDashboard'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import Background3D from '@/components/Background3D';
import { ThemeProvider } from '@/components/ThemeProvider';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
    const { user, isLoading } = useAuthStore()

    if (isLoading) return <div>Loading...</div>

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace /> // Or a 403 Forbidden page
    }

    return <>{children}</>
}

function App() {
    const { initialize } = useAuthStore()

    useEffect(() => {
        initialize()
    }, [initialize])

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Router>
                <div className="min-h-screen bg-background font-sans antialiased text-foreground">
                    <Background3D />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Dashboard Routes */}
                        <Route path="/" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><DashboardLayout /></ProtectedRoute>}>
                            <Route path="patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                            <Route path="patient/book" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
                            <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                            {/* Fallback for dashboard sub-routes */}
                            <Route path="patient/*" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                            <Route path="doctor/*" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                            <Route path="admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                        </Route>

                        {/* Global Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Toaster />
                </div>
            </Router>
        </ThemeProvider>
    )
}

export default App

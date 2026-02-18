import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';

// Validation Schemas
const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
    name: z.string().min(2, 'Name is required'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const isSignupInit = searchParams.get('signup') === 'true';
    const [isSignup, setIsSignup] = useState(isSignupInit);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup, loginWithGoogle, user } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    });

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'doctor') navigate('/doctor');
            else navigate('/patient');
        }
    }, [user, navigate]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (isSignup) {
                await signup(data.email, data.password, data.name);
                toast.success('Account created successfully!');
            } else {
                await login(data.email, data.password);
                toast.success('Logged in successfully!');
            }
            // Navigation handled by useEffect
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Authentication failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-teal-400/10 blur-3xl opacity-50" />
                <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-cyan-400/10 blur-3xl opacity-50" />
            </div>

            <Card className="w-full max-w-md relative z-10 border-white/20 shadow-2xl backdrop-blur-xl bg-white/70">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                        {isSignup ? 'Create an Account' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription>
                        {isSignup ? 'Join us to start your clear dental journey' : 'Enter your credentials to access your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {isSignup && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" placeholder="John Doe" {...register('name')} />
                                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
                            {errors.email && <span className="text-xs text-red-500">{errors.email.message as string}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                            {errors.password && <span className="text-xs text-red-500">{errors.password.message as string}</span>}
                        </div>

                        {isSignup && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                                {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message as string}</span>}
                            </div>
                        )}

                        <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/20" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isSignup ? 'Sign Up' : 'Log In'}
                            {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={isLoading}
                            onClick={async () => {
                                setIsLoading(true);
                                try {
                                    await loginWithGoogle();
                                    toast.success('Logged in with Google successfully!');
                                    // Navigation handled by useEffect
                                } catch (error: any) {
                                    console.error(error);
                                    toast.error(error.message || 'Google Sign-In failed');
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        >
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Google
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="link" onClick={() => setIsSignup(!isSignup)} className="text-sm text-muted-foreground">
                        {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { HeartHandshake } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof loginSchema> & {
  confirmPassword?: string;
};

const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const form = useForm<FormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : loginSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Failed to log in with Google', error);
      setError('Failed to log in with Google. Please try again.');
    }
  };

  const onSubmit = async (data: FormValues) => {
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password);
      } else {
        await signInWithEmail(data.email, data.password);
      }
    } catch (error: any) {
      console.error('Authentication failed', error);
      let errorMessage = 'Failed to authenticate. Please check your credentials.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use using another provider or account.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    form.reset({
      email: form.getValues('email'), // Preserve email
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 font-sans">
      {/* Background with blur */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center animate-in fade-in duration-1000"
        style={{ backgroundImage: "url('/img/login-bg-red.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#c2002f]/80 to-slate-900/60 backdrop-blur-md" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-xl sm:rounded-2xl overflow-hidden ring-1 ring-white/20">
        <div className="h-2 bg-gradient-to-r from-[#c2002f] via-rose-500 to-orange-500" />

        <CardHeader className="text-center pt-8 pb-6 px-10">
          <div className="mx-auto mb-6 bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
            <HeartHandshake className="w-10 h-10 text-[#c2002f]" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-slate-500 mt-2 text-base leading-relaxed">
            {isSignUp 
              ? 'Join the Champions Network to help save limbs.' 
              : 'Sign in to access your dashboard.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
                    {error}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          {...field} 
                          disabled={loading}
                          className="bg-white focus:ring-[#c2002f]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="••••••••" 
                          {...field} 
                          disabled={loading}
                          className="bg-white focus:ring-[#c2002f]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isSignUp && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            {...field} 
                            disabled={loading}
                            className="bg-white focus:ring-[#c2002f]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#c2002f] hover:bg-[#a00027] text-white"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/95 backdrop-blur-sm px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 group"
              variant="outline"
              disabled={loading}
            >
              <svg
                className="mr-3 h-5 w-5 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-slate-600">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-[#c2002f] hover:text-[#a00027] underline-offset-4 hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 max-w-xs mx-auto leading-normal">
              By continuing, you agree to our{' '}
              <a href="#" className="underline hover:text-slate-600">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-slate-600">
                Patient Privacy Policy
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer credits */}
      <div className="absolute bottom-4 text-center text-slate-300/60 text-xs z-10">
        © 2024 Champions Limb Preservation Network
      </div>
    </div>
  );
};

export default Login;

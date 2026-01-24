import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { HeartHandshake } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to log in', error);
    }
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
            Welcome, Volunteer!
          </CardTitle>
          <CardDescription className="text-slate-500 mt-2 text-base leading-relaxed">
            Join the Champions Network to help save limbs and transform lives.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          <div className="space-y-6">
            <Button 
              onClick={handleLogin} 
              className="w-full h-14 text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 group" 
              variant="outline"
            >
              <svg className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
              Sign in with Google
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/95 backdrop-blur-sm px-3 text-slate-400 font-medium">
                  Secured by Google
                </span>
              </div>
            </div>
            
            <p className="text-center text-xs text-slate-400 max-w-xs mx-auto leading-normal">
              By signing in, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Patient Privacy Policy</a>.
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

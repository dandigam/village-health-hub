import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import loginHero from '@/assets/login-hero.jpg';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const { login, loading, error: authError, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!userName.trim() || !password.trim()) {
      setLocalError('Please enter username and password');
      return;
    }

    try {
      await login(userName, password);
    } catch {
      // Error is set in AuthContext
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !userName.trim() || !password.trim() || !role) {
      setLocalError('Please fill in all fields');
      return;
    }

    // For now, just log and switch to signin
    console.log('Signup:', { fullName, email, phone, userName, password, role });
    setLocalError('');
    setMode('signin');
  };

  const displayError = localError || authError;

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setLocalError('');
  };

  const APP_NAME = 'HealthCamp Pro';
  const APP_TAGLINE = 'Medical Camp Management';

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-[60%] relative">
        <img src={loginHero} alt="Medical camp" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,85%,20%,0.7)] via-[hsl(220,75%,30%,0.4)] to-[hsl(220,85%,20%,0.6)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,85%,10%,0.6)] via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">{APP_NAME}</p>
              <p className="text-white/60 text-xs">Serving Communities with Care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-[40%] flex flex-col h-screen bg-muted/30 overflow-hidden">
        <div className="lg:hidden p-4 flex items-center gap-3">
          {mode === 'signup' && (
            <button type="button" onClick={() => switchMode('signin')} className="mr-1 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-foreground">{APP_NAME}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto min-h-0">
          <div className="w-full max-w-[400px] mx-auto">
            {/* Logo above card */}
            <div className="hidden lg:flex items-center gap-3 mb-6 relative">
              {mode === 'signup' && (
                <button type="button" onClick={() => switchMode('signin')} className="absolute left-0 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-3 mx-auto">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{APP_NAME}</p>
                  <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
                </div>
              </div>
            </div>

            {/* Sign In - Card */}
            {mode === 'signin' && (
              <div className="bg-background rounded-2xl border border-border shadow-xl shadow-black/5 p-6 sm:p-8">
                <div className="mb-5">
                  <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                  <p className="text-muted-foreground mt-1 text-sm">Sign in to continue to your dashboard</p>
                </div>

                {displayError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {displayError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-sm font-medium text-foreground">Username</Label>
                    <Input id="userName" placeholder="Enter your username" value={userName} onChange={(e) => setUserName(e.target.value)} className="h-11 bg-muted/50 border-input focus:bg-background transition-colors" disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                      <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Forgot Password?</button>
                    </div>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-muted/50 border-input focus:bg-background transition-colors pr-10" disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-11 font-semibold text-base">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-5">
                  Don't have an account?{' '}<button type="button" onClick={() => switchMode('signup')} className="text-primary hover:text-primary/80 font-medium transition-colors">Sign Up</button>
                </p>
              </div>
            )}

            {/* Sign Up - No card */}
            {mode === 'signup' && (
              <div>
                <div className="mb-5">
                  <h1 className="text-2xl font-bold text-foreground">Create account</h1>
                  <p className="text-muted-foreground mt-1 text-sm">Register to get started</p>
                </div>

                {displayError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {displayError}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">Full Name</Label>
                      <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 bg-muted/50 border-input focus:bg-background transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">Username</Label>
                      <Input placeholder="Choose username" value={userName} onChange={(e) => setUserName(e.target.value)} className="h-10 bg-muted/50 border-input focus:bg-background transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">Email</Label>
                      <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 bg-muted/50 border-input focus:bg-background transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                      <Input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 bg-muted/50 border-input focus:bg-background transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 bg-muted/50 border-input focus:bg-background transition-colors pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground">Who are you?</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-10 bg-muted/50 border-input focus:bg-background transition-colors">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="DOCTOR">Doctor</SelectItem>
                        <SelectItem value="NURSE">Nurse</SelectItem>
                        <SelectItem value="PHARMACIST">Pharmacy</SelectItem>
                        <SelectItem value="WARE_HOUSE">Warehouse</SelectItem>
                        <SelectItem value="FRONT_DESK">Front Desk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-10 font-semibold text-base">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Sign Up'}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-5">
                  Already have an account?{' '}<button type="button" onClick={() => switchMode('signin')} className="text-primary hover:text-primary/80 font-medium transition-colors">Sign In</button>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 text-center shrink-0">
          <p className="text-xs text-muted-foreground">© 2026 {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

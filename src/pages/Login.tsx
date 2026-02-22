import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, EyeOff, Loader2, ArrowLeft, Shield, Users, Activity } from 'lucide-react';
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

  const formVariants = {
    initial: { opacity: 0, x: mode === 'signup' ? 30 : -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: mode === 'signup' ? -30 : 30 },
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <img src={loginHero} alt="Medical camp" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,85%,15%,0.85)] via-[hsl(220,75%,25%,0.6)] to-[hsl(260,70%,20%,0.7)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,85%,8%,0.7)] via-transparent to-transparent" />
        
        {/* Floating feature badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute top-12 left-8 right-8"
        >
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <Shield className="w-4 h-4 text-[hsl(152,65%,55%)]" />
              <span className="text-white/90 text-xs font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <Users className="w-4 h-4 text-[hsl(215,80%,65%)]" />
              <span className="text-white/90 text-xs font-medium">Multi-Role Access</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <Activity className="w-4 h-4 text-[hsl(340,70%,65%)]" />
              <span className="text-white/90 text-xs font-medium">Real-time Tracking</span>
            </div>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="absolute bottom-12 left-8 right-8"
        >
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Streamline Your<br />
            <span className="bg-gradient-to-r from-[hsl(215,80%,70%)] to-[hsl(260,70%,75%)] bg-clip-text text-transparent">Medical Camp Operations</span>
          </h2>
          <p className="text-white/60 text-sm max-w-md leading-relaxed">
            End-to-end patient management, pharmacy workflows, and real-time analytics — all in one platform.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{APP_NAME}</p>
              <p className="text-white/50 text-xs">Serving Communities with Care</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-[40%] flex flex-col h-screen bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden">
        <div className="lg:hidden p-4 flex items-center gap-3">
          {mode === 'signup' && (
            <button type="button" onClick={() => switchMode('signin')} className="mr-1 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Heart className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-foreground">{APP_NAME}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto min-h-0">
          <div className="w-full max-w-[400px] mx-auto">
            {/* Logo above card */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="hidden lg:flex items-center gap-3 mb-8 relative"
            >
              {mode === 'signup' && (
                <button type="button" onClick={() => switchMode('signin')} className="absolute left-0 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-3 mx-auto">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground tracking-tight">{APP_NAME}</p>
                  <p className="text-xs text-muted-foreground font-medium">{APP_TAGLINE}</p>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Sign In - Card */}
              {mode === 'signin' && (
                <motion.div
                  key="signin"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="bg-card rounded-2xl border border-border shadow-xl shadow-black/[0.06] p-6 sm:p-8"
                >
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">Sign in to continue to your dashboard</p>
                  </div>

                  {displayError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                    >
                      {displayError}
                    </motion.div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-sm font-semibold text-foreground">Username</Label>
                      <Input id="userName" placeholder="Enter your username" value={userName} onChange={(e) => setUserName(e.target.value)} className="h-11 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200" disabled={loading} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                        <button type="button" className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">Forgot Password?</button>
                      </div>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200 pr-10" disabled={loading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground mt-6">
                    Don't have an account?{' '}<button type="button" onClick={() => switchMode('signup')} className="text-primary hover:text-primary/80 font-semibold transition-colors">Sign Up</button>
                  </p>
                </motion.div>
              )}

              {/* Sign Up - No card */}
              {mode === 'signup' && (
                <motion.div
                  key="signup"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="mb-5">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Create account</h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">Register to get started</p>
                  </div>

                  {displayError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                    >
                      {displayError}
                    </motion.div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground">Full Name</Label>
                        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground">Username</Label>
                        <Input placeholder="Choose username" value={userName} onChange={(e) => setUserName(e.target.value)} className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground">Email</Label>
                        <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-foreground">Phone Number</Label>
                        <Input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground">Password</Label>
                      <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-foreground">Who are you?</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:border-primary/50 transition-all duration-200">
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

                    <Button type="submit" disabled={loading} className="w-full h-10 font-semibold text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Sign Up'}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground mt-5">
                    Already have an account?{' '}<button type="button" onClick={() => switchMode('signin')} className="text-primary hover:text-primary/80 font-semibold transition-colors">Sign In</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 text-center shrink-0">
          <p className="text-xs text-muted-foreground">© 2026 {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

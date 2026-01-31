import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Eye, EyeOff } from 'lucide-react';
import loginHero from '@/assets/login-hero.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/select-camp');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[60%] relative">
        <img 
          src={loginHero} 
          alt="Medical camp" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Bottom branding */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">Srini Foundation</p>
              <p className="text-white/60 text-xs">Serving Communities with Care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[40%] flex flex-col min-h-screen bg-background">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-foreground">Srini Foundation</span>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Logo for Desktop */}
            <div className="hidden lg:flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">Srini Foundation</p>
                <p className="text-xs text-muted-foreground">Medical Camp Management</p>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email or Mobile
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email or mobile"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-muted/50 border-input focus:bg-background transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <button 
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-muted/50 border-input focus:bg-background transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-background text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Alternative Login Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 border-input hover:bg-muted/50 text-foreground font-medium"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="h-11 border-input hover:bg-muted/50 text-foreground font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground mt-8">
              Don't have an account?{' '}
              <button type="button" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Contact Admin
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="p-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Srini Foundation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

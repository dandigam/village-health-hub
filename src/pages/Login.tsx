import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo, just navigate to camp selection
    navigate('/select-camp');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-end pr-8 md:pr-16 lg:pr-24">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(30, 58, 95, 0.9), rgba(30, 58, 95, 0.7)), url('/placeholder.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Left Logo */}
      <div className="absolute top-6 left-6 z-10">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-xs">ఉత్తమ పౌర సమాజమే</p>
            <p className="text-2xl font-bold">🤝</p>
            <p className="text-xs">జన విజ్ఞాన విద్యా లక్ష్యం</p>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl">🔥</span>
              </div>
              <div>
                <span className="text-2xl font-bold">
                  <span className="text-yellow-500">G</span>
                  <span className="text-teal-500">B</span>
                  <span className="text-purple-500">R</span>
                </span>
                <p className="text-xs text-muted-foreground -mt-1">FOUNDATION</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90"
            >
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

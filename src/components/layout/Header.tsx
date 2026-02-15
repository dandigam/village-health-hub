import { Bell, Search, User, LogOut, Settings, MapPin, ChevronDown, Check, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser, useCamps } from '@/hooks/useApiData';
import { useCamp } from '@/context/CampContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { selectedCamp, setSelectedCamp } = useCamp();
  const { data: user } = useCurrentUser();
  const { data: camps = [] } = useCamps();

  const currentUser = user || { name: '', phone: '', avatar: undefined };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="h-14 sm:h-16 bg-primary flex items-center justify-between px-3 sm:px-4 lg:px-6 print:hidden sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        {onMenuToggle && (
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <span className="text-lg sm:text-xl font-bold text-primary-foreground">S</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-primary-foreground">Srini</span>
            <span className="text-xs text-primary-foreground/70 block -mt-1">FOUNDATION</span>
          </div>
        </div>
        <div className="hidden md:block border-l border-primary-foreground/20 pl-4 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-2 text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-foreground/70" />
                <div className="text-left">
                  <p className="text-sm font-medium">{selectedCamp || 'Select Camp'}</p>
                  <p className="text-[10px] text-primary-foreground/70">Current Camp</p>
                </div>
                <ChevronDown className="h-4 w-4 text-primary-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 z-50 bg-card">
              <DropdownMenuLabel>Select Camp Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {camps.map((camp) => (
                <DropdownMenuItem key={camp.id} onClick={() => setSelectedCamp(camp.name)} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium">{camp.name}</p>
                    <p className="text-xs text-muted-foreground">{camp.location}</p>
                  </div>
                  {selectedCamp === camp.name && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="hidden lg:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search Patient by MR Number / First Name / Surname" className="pl-10 bg-primary-foreground border-0" />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10 px-1 sm:px-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs opacity-70">Front Desk | {currentUser.phone}</p>
              </div>
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

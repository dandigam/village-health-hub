import { Bell, Search, User, LogOut, Settings, MapPin, ChevronDown, Check, Menu, ShoppingCart } from 'lucide-react';
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
import { useCamps, useSupplierOrders } from '@/hooks/useApiData';
import { useCamp } from '@/context/CampContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { selectedCamp, setSelectedCamp } = useCamp();
  const { user: authUser, logout } = useAuth();
  const { data: camps = [] } = useCamps();
  const { data: supplierOrders = [] } = useSupplierOrders();
  const pendingOrdersCount = supplierOrders.filter(o => o.status === 'sent' || o.status === 'pending').length;

  const currentUser = { name: authUser?.name || '', role: authUser?.role || '', avatar: undefined as string | undefined };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 sm:h-16 bg-gradient-to-r from-primary to-accent flex items-center justify-between px-3 sm:px-4 lg:px-6 print:hidden sticky top-0 z-50 shadow-lg shadow-primary/20">
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
            <span className="text-lg font-bold text-primary-foreground">HealthCamp</span>
            <span className="text-xs text-primary-foreground/70 block -mt-1">PRO</span>
          </div>
        </div>
        <div className="hidden md:block border-l border-primary-foreground/20 pl-4 ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-2 text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-foreground/70" />
                <div className="text-left">
                  <p className="text-sm font-medium">{currentUser.name ? currentUser.name : selectedCamp || 'Select Camp'}</p>
                 {currentUser.role !== "WARE_HOUSE" ? <p className="text-[10px] text-primary-foreground/70">Current Camp</p> : null}
                </div>
                {currentUser.role !== "WARE_HOUSE" ? <ChevronDown className="h-4 w-4 text-primary-foreground/70" /> : null}
              </Button>
            </DropdownMenuTrigger>
           {currentUser.role !== "WARE_HOUSE" ? <DropdownMenuContent align="start" className="w-56 z-50 bg-card">
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
            </DropdownMenuContent> : null}
          </DropdownMenu>
        </div>
      </div>

      <div className="hidden lg:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={currentUser.role === "WARE_HOUSE" ? "Search Supplier Medicines..." : "Search Patient by MR Number / First Name / Surname"} 
            className="pl-10 bg-primary-foreground border-0" 
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate('/supplier-orders')}>
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          {pendingOrdersCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {pendingOrdersCount}
            </span>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10 px-1 sm:px-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs opacity-70">{currentUser.role}</p>
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

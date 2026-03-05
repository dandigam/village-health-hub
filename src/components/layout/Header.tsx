import { Bell, Search, User, LogOut, Settings, MapPin, Menu, ShoppingCart, Heart } from 'lucide-react';
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
import { useSupplierOrders, useWarehouseDetail } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { hasAccess } from '@/config/routeAccess';
import { Warehouse } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { data: supplierOrders = [] } = useSupplierOrders();
  const pendingOrdersCount = supplierOrders.filter(o => o.status === 'sent' || o.status === 'pending').length;

  const currentUser = { name: authUser?.name || '', role: authUser?.roleDisplayName || authUser?.role || '', avatar: authUser?.avatar || undefined as string | undefined };
  const campName = authUser?.context?.campName;

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className="h-14 sm:h-[60px] flex items-center justify-between px-3 sm:px-4 lg:px-6 print:hidden sticky top-0 z-50 border-b border-white/[0.08]"
      style={{
        background: 'linear-gradient(135deg, hsl(224, 58%, 15%) 0%, hsl(222, 70%, 28%) 50%, hsl(230, 65%, 32%) 100%)',
        boxShadow: '0 2px 20px hsl(222, 70%, 10% / 0.4)',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {onMenuToggle && (
          <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-white/10 h-9 w-9" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[hsl(340,70%,50%)]/20 backdrop-blur-sm flex items-center justify-center border border-[hsl(340,70%,60%)]/30">
            <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-[hsl(340,75%,60%)]" fill="currentColor" />
          </div>
          <div className="hidden sm:block">
            <span className="text-[13px] font-bold text-white tracking-tight leading-tight block">Medical Camp</span>
            <span className="text-[10px] text-white/60 block -mt-0.5 font-medium">Management System</span>
          </div>
        </div>
        {campName && (
          <div className="hidden md:flex items-center gap-2 border-l border-white/15 pl-4 ml-2">
            <MapPin className="h-4 w-4 text-white/60" />
            <div>
              <p className="text-sm font-medium text-white">{campName}</p>
              <p className="text-[10px] text-white/50">Current Camp</p>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
          <Input 
            placeholder={currentUser.role === "WAREHOUSE" ? "Search Supplier Medicines..." : "Search Patient by MR Number / First Name / Surname"} 
            className="pl-10 bg-white/95 border-0 shadow-sm text-foreground placeholder:text-muted-foreground/60 h-9 rounded-lg" 
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/[0.08] h-8 w-8 sm:h-9 sm:w-9">
          <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </Button>
        {hasAccess('supplier-orders', authUser?.role) && (
          <Button variant="ghost" size="icon" className="relative text-white/80 hover:text-white hover:bg-white/[0.08] h-8 w-8 sm:h-9 sm:w-9" onClick={() => navigate('/supplier-orders')}>
            <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-enter">
                {pendingOrdersCount}
              </span>
            )}
          </Button>
        )}
        <div className="w-px h-6 bg-white/15 mx-1 hidden sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/[0.08] px-1.5 sm:px-2">
              <div className="hidden sm:block text-right">
                <p className="text-[13px] font-semibold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-white/50 font-medium">{currentUser.role}</p>
              </div>
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-white/20">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-[hsl(222,60%,40%)] text-white text-xs font-semibold">
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
import { Bell, Search, User } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockUser } from '@/data/mockData';

interface HeaderProps {
  campName?: string;
}

export function Header({ campName = 'GBR Foundation' }: HeaderProps) {
  return (
    <header className="h-16 bg-primary flex items-center justify-between px-4 lg:px-6">
      {/* Left: Logo & Camp Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">G</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold text-primary-foreground">GBR</span>
            <span className="text-xs text-primary-foreground/70 block -mt-1">FOUNDATION</span>
          </div>
        </div>
        {campName && (
          <div className="hidden md:block border-l border-primary-foreground/20 pl-4 ml-2">
            <p className="text-primary-foreground font-medium">{campName}</p>
            <p className="text-xs text-primary-foreground/70">Camp</p>
          </div>
        )}
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Patient by MR Number / First Name / Surname"
            className="pl-10 bg-primary-foreground border-0"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{mockUser.name}</p>
                <p className="text-xs opacity-70">Front Desk | {mockUser.phone}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

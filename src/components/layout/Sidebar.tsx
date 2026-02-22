import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tent,
  Users,
  Pill,
  ClipboardList,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  
  Activity,
  Truck,
  ShoppingCart,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { hasAccess } from '@/config/routeAccess';

const allNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', routeKey: 'dashboard' },
  { icon: Tent, label: 'Camps', href: '/camps', routeKey: 'camps' },
  { icon: Users, label: 'Patients', href: '/patients', routeKey: 'patients' },
  { icon: Activity, label: 'Encounters', href: '/encounters', routeKey: 'encounters' },
  { icon: Pill, label: 'Pharmacy', href: '/pharmacy', routeKey: 'pharmacy' },
  { icon: Package, label: 'Stock', href: '/stock', routeKey: 'stock' },
  { icon: Truck, label: 'Suppliers', href: '/suppliers', routeKey: 'suppliers' },
  { icon: ShoppingCart, label: 'Supplier Orders', href: '/supplier-orders', routeKey: 'supplier-orders' },
  { icon: ArrowRightLeft, label: 'Distribution', href: '/distribution-orders', routeKey: 'distribution-orders' },
  { icon: ClipboardList, label: 'Doctors', href: '/doctors', routeKey: 'doctors' },
  { icon: FileText, label: 'Reports', href: '/reports', routeKey: 'reports' },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapsed = mobile ? false : isCollapsed;
  const { user } = useAuth();

  const mainNavItems = allNavItems.filter(item => hasAccess(item.routeKey, user?.role));

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  const activeClass = 'bg-white/20 text-white shadow-md shadow-black/10 border border-white/10';
  const inactiveClass = 'text-white/65 hover:text-white hover:bg-white/10 border border-transparent';

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "relative bg-gradient-to-b from-[hsl(220,80%,18%)] via-sidebar to-[hsl(220,70%,12%)] flex flex-col border-r border-white/5 shadow-2xl transition-all duration-300 ease-in-out h-screen sticky top-0",
          mobile ? "w-full h-full" : "hidden md:flex",
          !mobile && (collapsed ? "w-[68px]" : "w-48"),
        )}
      >
        {/* Collapse Toggle Button - desktop only */}
        {!mobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 z-10"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Navigation */}
        <nav className="pt-4 px-2 overflow-y-auto flex-1 min-h-0">
          <ul className="space-y-0.5">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all duration-200',
                            isActive ? activeClass : inactiveClass
                          )
                        }
                      >
                        {({ isActive }) => (
                          <item.icon className={cn("h-[18px] w-[18px] transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-foreground text-background border-0 font-medium px-3 py-1.5 text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive ? activeClass : inactiveClass
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110")} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings */}
        <div className="p-2 border-t border-white/10 shrink-0">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all duration-200',
                      isActive ? activeClass : inactiveClass
                    )
                  }
                >
                  {({ isActive }) => (
                    <Settings className={cn("h-[18px] w-[18px] transition-transform duration-200", !isActive && "group-hover:scale-110 group-hover:rotate-45")} />
                  )}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-foreground text-background border-0 font-medium px-3 py-1.5 text-xs">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive ? activeClass : inactiveClass
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Settings className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110 group-hover:rotate-45")} />
                  <span>Settings</span>
                </>
              )}
            </NavLink>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

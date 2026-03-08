import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tent,
  CalendarDays,
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
  Warehouse as WarehouseIcon,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { hasAccess } from '@/config/routeAccess';

type NavItem = {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  routeKey: string;
  color: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', routeKey: 'dashboard', color: 'hsl(220, 90%, 65%)' },
    ],
  },
  {
    title: 'Clinical',
    items: [
      { icon: Tent, label: 'Camp Templates', href: '/camp-templates', routeKey: 'camp-templates', color: 'hsl(280, 70%, 65%)' },
      { icon: CalendarDays, label: 'Camp Events', href: '/camp-events', routeKey: 'camp-events', color: 'hsl(340, 75%, 65%)' },
      { icon: Users, label: 'Patients', href: '/patients', routeKey: 'patients', color: 'hsl(200, 85%, 60%)' },
      { icon: Activity, label: 'Encounters', href: '/encounters', routeKey: 'encounters', color: 'hsl(350, 80%, 62%)' },
      { icon: Pill, label: 'Pharmacy', href: '/pharmacy', routeKey: 'pharmacy', color: 'hsl(160, 70%, 55%)' },
      { icon: ClipboardList, label: 'Doctors', href: '/doctors', routeKey: 'doctors', color: 'hsl(170, 70%, 50%)' },
    ],
  },
  {
    title: 'Supply Chain',
    items: [
      { icon: Package, label: 'Inventory', href: '/stock', routeKey: 'stock', color: 'hsl(35, 90%, 60%)' },
      { icon: Truck, label: 'Suppliers', href: '/suppliers', routeKey: 'suppliers', color: 'hsl(140, 65%, 55%)' },
      { icon: ShoppingCart, label: 'Supplier Orders', href: '/supplier-orders', routeKey: 'supplier-orders', color: 'hsl(25, 95%, 60%)' },
      { icon: ArrowRightLeft, label: 'Distribution', href: '/distribution-orders', routeKey: 'distribution-orders', color: 'hsl(270, 70%, 65%)' },
      { icon: WarehouseIcon, label: 'Warehouses', href: '/warehouses', routeKey: 'warehouses', color: 'hsl(210, 60%, 60%)' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { icon: FileText, label: 'Invoices', href: '/invoices', routeKey: 'invoices', color: 'hsl(190, 80%, 55%)' },
      { icon: BarChart3, label: 'Reports', href: '/reports', routeKey: 'reports', color: 'hsl(45, 90%, 55%)' },
    ],
  },
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

  const activeClass = 'bg-white/[0.14] text-white border-l-[3px] border-l-[hsl(200,90%,60%)] shadow-[inset_0_0_20px_rgba(255,255,255,0.04)]';
  const inactiveClass = 'text-white/55 hover:text-white/90 hover:bg-white/[0.06] border-l-[3px] border-l-transparent';

  const renderNavItem = (item: typeof allNavItems[0], isActive: boolean) => (
    <>
      <item.icon 
        className="h-[17px] w-[17px] shrink-0 transition-all duration-200"
        style={{ color: item.color, opacity: isActive ? 1 : 0.5 }}
      />
      {!collapsed && (
        <span className={cn("truncate text-[13px]", isActive ? "font-semibold" : "font-medium")}>
          {item.label}
        </span>
      )}
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "relative flex flex-col border-r border-white/[0.06] h-screen sticky top-0 transition-all duration-300 ease-in-out premium-scroll",
          "bg-[hsl(224,58%,12%)]",
          mobile ? "w-full h-full" : "hidden md:flex",
          !mobile && (collapsed ? "w-[68px]" : "w-48"),
        )}
        style={{
          background: 'linear-gradient(180deg, hsl(224, 58%, 15%) 0%, hsl(224, 55%, 11%) 50%, hsl(228, 50%, 9%) 100%)',
        }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[hsl(222,80%,50%)]/[0.06] to-transparent pointer-events-none" />

        {/* Collapse Toggle */}
        {!mobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 z-10"
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
                            isActive 
                              ? 'bg-white/[0.14] text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.04)]' 
                              : 'text-white/55 hover:text-white/90 hover:bg-white/[0.06]'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <item.icon 
                            className="h-[17px] w-[17px] transition-all duration-200"
                            style={{ color: item.color, opacity: isActive ? 1 : 0.5 }}
                          />
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
                        'group flex items-center gap-2.5 px-3 py-2 rounded-r-lg text-sm transition-all duration-200',
                        isActive ? activeClass : inactiveClass
                      )
                    }
                  >
                    {({ isActive }) => renderNavItem(item, isActive)}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings - pinned bottom */}
        <div className="p-2 border-t border-white/[0.08] shrink-0">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-all duration-200',
                      isActive 
                        ? 'bg-white/[0.14] text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.04)]' 
                        : 'text-white/55 hover:text-white/90 hover:bg-white/[0.06]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <Settings 
                      className="h-[17px] w-[17px] transition-all duration-200 group-hover:rotate-45"
                      style={{ color: 'hsl(220, 15%, 65%)', opacity: isActive ? 1 : 0.6 }}
                    />
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
                  'group flex items-center gap-2.5 px-3 py-2 rounded-r-lg text-sm transition-all duration-200',
                  isActive ? activeClass : inactiveClass
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Settings 
                    className="h-[17px] w-[17px] shrink-0 transition-all duration-200 group-hover:rotate-45"
                    style={{ color: 'hsl(220, 15%, 65%)', opacity: isActive ? 1 : 0.6 }}
                  />
                  <span className={cn("truncate text-[13px]", isActive ? "font-semibold" : "font-medium")}>
                    Settings
                  </span>
                </>
              )}
            </NavLink>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
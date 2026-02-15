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
  Heart,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Tent, label: 'Camps', href: '/camps' },
  { icon: Users, label: 'Patients', href: '/patients' },
  { icon: Activity, label: 'Encounters', href: '/encounters' },
  { icon: Pill, label: 'Pharmacy', href: '/pharmacy' },
  { icon: Package, label: 'Stock', href: '/stock' },
  { icon: ClipboardList, label: 'Doctors', href: '/doctors' },
  { icon: FileText, label: 'Reports', href: '/reports' },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ mobile, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapsed = mobile ? false : isCollapsed;

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  const activeClass = 'bg-white/15 text-white shadow-sm';
  const inactiveClass = 'text-white/70 hover:text-white hover:bg-white/8';

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "relative bg-gradient-to-b from-sidebar to-[hsl(var(--sidebar-accent))] flex flex-col border-r border-sidebar-border shadow-xl transition-all duration-300 ease-in-out",
          mobile ? "w-full min-h-screen" : "hidden md:flex min-h-screen",
          !mobile && (collapsed ? "w-[68px]" : "w-44"),
        )}
      >
        {/* Header with Logo */}
        <div className={cn(
          "flex items-center h-14 sm:h-16 border-b border-white/10 transition-all duration-300",
          collapsed ? "justify-center px-2" : "px-4 gap-3"
        )}>
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shadow-lg shrink-0">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <p className="font-bold text-white text-sm whitespace-nowrap">Medical Camp</p>
            <p className="text-[10px] text-white/60 whitespace-nowrap">Management System</p>
          </div>
        </div>

        {/* Collapse Toggle Button - desktop only */}
        {!mobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 z-10"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Navigation */}
        <nav className="py-4 px-2 overflow-y-auto flex-1">
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
        <div className="p-2 border-t border-white/10">
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

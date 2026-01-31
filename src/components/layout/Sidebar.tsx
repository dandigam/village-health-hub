import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tent,
  Users,
  Stethoscope,
  Pill,
  ClipboardList,
  Package,
  FileText,
  Settings,
  FileEdit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Tent, label: 'Camps', href: '/camps' },
  { icon: Users, label: 'Patients', href: '/patients' },
  { icon: FileEdit, label: 'SOAP Notes', href: '/soap' },
  { icon: Stethoscope, label: 'Consultations', href: '/consultations' },
  { icon: Pill, label: 'Pharmacy', href: '/pharmacy' },
  { icon: Package, label: 'Stock', href: '/stock' },
  { icon: ClipboardList, label: 'Doctors', href: '/doctors' },
  { icon: FileText, label: 'Reports', href: '/reports' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "bg-sidebar min-h-screen flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse Toggle */}
        <div className={cn("px-2 mb-2", isCollapsed ? "flex justify-center" : "flex justify-end pr-3")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2">
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-center p-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          )
                        }
                      >
                        <item.icon className="w-5 h-5" />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings at bottom */}
        <div className="p-2 border-t border-sidebar-border">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-center p-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    )
                  }
                >
                  <Settings className="w-5 h-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )
              }
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

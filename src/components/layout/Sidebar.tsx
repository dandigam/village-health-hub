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
  Heart,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "relative bg-gradient-to-b from-[hsl(215,70%,18%)] to-[hsl(215,70%,22%)] min-h-screen flex flex-col border-r border-white/10 shadow-xl transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Header with Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-white/10 transition-all duration-300",
          isCollapsed ? "justify-center px-2" : "px-4 gap-3"
        )}>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shrink-0">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <p className="font-bold text-white text-sm whitespace-nowrap">Medical Camp</p>
            <p className="text-[10px] text-white/60 whitespace-nowrap">Management System</p>
          </div>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-20 h-6 w-6 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all duration-200 z-10"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Navigation */}
        <nav className="py-4 px-2 overflow-y-auto">
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
                            'group flex items-center justify-center h-11 w-11 mx-auto rounded-xl transition-all duration-200',
                            isActive
                              ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            !isActive && "group-hover:scale-110"
                          )} />
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="right" 
                      className="bg-gray-900 text-white border-0 font-medium px-3 py-1.5 text-xs"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-200",
                          !isActive && "group-hover:scale-110"
                        )} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings at bottom - no extra spacing */}
        <div className="p-2 mt-auto border-t border-white/10">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-center h-11 w-11 mx-auto rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    )
                  }
                >
                  {({ isActive }) => (
                    <Settings className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      !isActive && "group-hover:scale-110 group-hover:rotate-45"
                    )} />
                  )}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="bg-gray-900 text-white border-0 font-medium px-3 py-1.5 text-xs"
              >
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Settings className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200",
                    !isActive && "group-hover:scale-110 group-hover:rotate-45"
                  )} />
                  <span>Settings</span>
                </>
              )}
            </NavLink>
          )}
        </div>

        {/* User Profile Section */}
        <div className={cn(
          "p-3 border-t border-white/10 bg-white/5",
          isCollapsed ? "flex justify-center" : ""
        )}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform shadow-lg">
                  V
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="bg-gray-900 text-white border-0 px-3 py-2"
              >
                <p className="font-medium text-xs">Venkatesh Dandigam</p>
                <p className="text-[10px] text-gray-400">Camp Admin</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                V
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">Venkatesh Dandigam</p>
                <p className="text-[10px] text-white/60">Camp Admin</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
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
  Heart,
  Droplets,
  Activity,
  Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Tent, label: 'Camps', href: '/camps' },
  { icon: Users, label: 'Patients', href: '/patients' },
  { icon: Stethoscope, label: 'Doctors', href: '/doctors' },
  { icon: Pill, label: 'Pharmacy', href: '/pharmacy' },
  { icon: ClipboardList, label: 'Consultations', href: '/consultations' },
  { icon: Package, label: 'Stock', href: '/stock' },
  { icon: FileText, label: 'Reports', href: '/reports' },
];

const medicalIcons = [
  { icon: Heart, color: 'text-red-400' },
  { icon: Droplets, color: 'text-red-500' },
  { icon: Activity, color: 'text-red-400' },
  { icon: Wind, color: 'text-red-400' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      {/* Medical Icon Display */}
      <div className="p-4 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full bg-card flex items-center justify-center mb-4 shadow-lg">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
            <Stethoscope className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Decorative Medical Icons */}
        <div className="flex flex-col gap-3 mt-2">
          {medicalIcons.map((item, index) => (
            <div
              key={index}
              className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center"
            >
              <item.icon className={cn('w-5 h-5', item.color)} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.href}>
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
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="p-3 border-t border-sidebar-border">
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
      </div>
    </aside>
  );
}

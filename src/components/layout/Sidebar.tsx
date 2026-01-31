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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      {/* Medical Icon Display */}
      <div className="p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-sidebar-foreground">Medical Camp</p>
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

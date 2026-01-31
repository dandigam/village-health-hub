import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  campName?: string;
}

export function DashboardLayout({ children, campName }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header campName={campName} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

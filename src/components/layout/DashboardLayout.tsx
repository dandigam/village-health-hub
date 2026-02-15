import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <div className="flex">
        {isMobile ? (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[220px] border-0">
              <Sidebar mobile onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        ) : (
          <Sidebar />
        )}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

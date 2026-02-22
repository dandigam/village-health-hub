import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/pages/Dashboard';
import WarehouseDashboard from '@/pages/dashboard/WarehouseDashboard';
import PharmacyDashboardOverview from '@/pages/dashboard/PharmacyDashboardOverview';

export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'WARE_HOUSE':
      return <WarehouseDashboard />;
    case 'PHARMACIST':
      return <PharmacyDashboardOverview />;
    default:
      return <Dashboard />;
  }
}

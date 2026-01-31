import { ClipboardList, Pill, CreditCard, Syringe, LogOut } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PatientSearch } from '@/components/dashboard/PatientSearch';
import { mockCampStats } from '@/data/mockData';

export default function Dashboard() {
  return (
    <DashboardLayout campName="Bapatla">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total Registrations"
          value={mockCampStats.totalPatients}
          icon={ClipboardList}
          variant="blue"
        />
        <StatCard
          title="Patients at Doctor"
          value={mockCampStats.patientsAtDoctor}
          icon={ClipboardList}
          variant="orange"
        />
        <StatCard
          title="Patients at Pharmacy"
          value={mockCampStats.patientsAtPharmacy}
          icon={Pill}
          variant="teal"
        />
        <StatCard
          title="Patients at Cashier"
          value={mockCampStats.patientsAtCashier}
          icon={CreditCard}
          variant="green"
        />
        <StatCard
          title="Patients at Insulin"
          value={12}
          icon={Syringe}
          variant="purple"
        />
        <StatCard
          title="Exit"
          value={mockCampStats.exitedPatients}
          icon={LogOut}
          variant="pink"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PatientSearch />
        
        {/* Recent Activity or Queue Visualization */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Patient Queue</h3>
          <div className="flex flex-wrap gap-2 justify-center py-8">
            {/* Simple patient avatars representation */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-medium text-blue-800"
              >
                P{i + 1}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            12 patients waiting in queue
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Pill, 
  CreditCard, 
  Syringe, 
  LogOut,
  UserPlus,
  Search,
  FileEdit,
  Stethoscope,
  CheckCircle2,
  Circle,
  Tent,
  Package,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCampStats, mockPatients, mockCamps } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Check if there's real data
const hasActiveCamp = mockCamps.some(camp => camp.status === 'active');
const hasPatients = mockPatients.length > 0;
const hasDoctors = true; // Mock check
const hasPharmacy = true; // Mock check
const hasStock = true; // Mock check
const showInsulinCard = true; // Toggle for insulin workflow

// Status cards configuration
const statusCards = [
  { 
    id: 'registrations',
    title: 'Total Registrations', 
    value: mockCampStats.totalPatients, 
    icon: ClipboardList, 
    variant: 'blue' as const,
    filterStatus: 'all',
  },
  { 
    id: 'doctor',
    title: 'Patients at Doctor', 
    value: mockCampStats.patientsAtDoctor, 
    icon: Stethoscope, 
    variant: 'orange' as const,
    filterStatus: 'with_doctor',
  },
  { 
    id: 'pharmacy',
    title: 'Patients at Pharmacy', 
    value: mockCampStats.patientsAtPharmacy, 
    icon: Pill, 
    variant: 'teal' as const,
    filterStatus: 'at_pharmacy',
  },
  { 
    id: 'cashier',
    title: 'Patients at Cashier', 
    value: mockCampStats.patientsAtCashier, 
    icon: CreditCard, 
    variant: 'green' as const,
    filterStatus: 'at_cashier',
  },
  ...(showInsulinCard ? [{
    id: 'insulin',
    title: 'Patients at Insulin', 
    value: 12, 
    icon: Syringe, 
    variant: 'purple' as const,
    filterStatus: 'at_insulin',
  }] : []),
  { 
    id: 'completed',
    title: 'Completed', 
    value: mockCampStats.exitedPatients, 
    icon: LogOut, 
    variant: 'pink' as const,
    filterStatus: 'completed',
  },
];

const variantStyles = {
  blue: 'stat-card-blue text-stat-blue-text',
  green: 'stat-card-green text-stat-green-text',
  orange: 'stat-card-orange text-stat-orange-text',
  pink: 'stat-card-pink text-stat-pink-text',
  purple: 'stat-card-purple text-stat-purple-text',
  teal: 'stat-card-teal text-stat-teal-text',
};

const iconBgStyles = {
  blue: 'bg-stat-blue-text/10',
  green: 'bg-stat-green-text/10',
  orange: 'bg-stat-orange-text/10',
  pink: 'bg-stat-pink-text/10',
  purple: 'bg-stat-purple-text/10',
  teal: 'bg-stat-teal-text/10',
};

// Setup steps for first-time users
const setupSteps = [
  { id: 'camp', label: 'Create Camp', href: '/camps/new', icon: Tent, completed: hasActiveCamp },
  { id: 'doctor', label: 'Add Doctor', href: '/doctors/new', icon: Users, completed: hasDoctors },
  { id: 'pharmacy', label: 'Add Pharmacy', href: '/pharmacy', icon: Pill, completed: hasPharmacy },
  { id: 'stock', label: 'Add Stock', href: '/stock', icon: Package, completed: hasStock },
  { id: 'patient', label: 'Register First Patient', href: '/patients/new', icon: UserPlus, completed: hasPatients },
];

// Recent patients mock data with status
const recentPatients = mockPatients.slice(0, 10).map((patient, index) => ({
  ...patient,
  status: ['At Doctor', 'At Pharmacy', 'At Cashier', 'Completed', 'Waiting'][index % 5],
  lastUpdated: new Date(Date.now() - index * 1000 * 60 * 15).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }),
}));

export default function Dashboard() {
  const navigate = useNavigate();
  const [isZeroState] = useState(!hasActiveCamp || !hasPatients);

  const handleCardClick = (filterStatus: string) => {
    navigate(`/patients?status=${filterStatus}`);
  };

  return (
    <DashboardLayout campName="Bapatla">
      {/* 1️⃣ Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statusCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.filterStatus)}
            className={cn(
              'stat-card cursor-pointer transition-transform hover:scale-105 text-left',
              variantStyles[card.variant]
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', iconBgStyles[card.variant])}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.value === 0 && (
                  <p className="text-xs text-muted-foreground">No patients yet</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 2️⃣ First-Time Setup Panel (Zero State Only) */}
      {isZeroState && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">👉</span> Start Your First Medical Camp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {setupSteps.map((step) => (
                <Button
                  key={step.id}
                  variant={step.completed ? "secondary" : "outline"}
                  className={cn(
                    "flex items-center gap-2 h-auto py-3 px-4",
                    step.completed && "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  )}
                  onClick={() => navigate(step.href)}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <step.icon className="w-4 h-4" />
                  <span className="font-medium">{step.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3️⃣ Quick Actions */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/patients/new')}
              disabled={!hasActiveCamp}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add New Patient
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/patients')}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find Patient
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/soap/new')}
              disabled={!hasPatients}
              className="flex items-center gap-2"
            >
              <FileEdit className="w-4 h-4" />
              Add SOAP Notes
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/consultations/new')}
              disabled={!hasPatients}
              className="flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              Start Consultation
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/pharmacy')}
              className="flex items-center gap-2"
            >
              <Pill className="w-4 h-4" />
              Open Pharmacy
            </Button>
          </div>
          {!hasActiveCamp && (
            <p className="text-sm text-muted-foreground mt-3">
              ⚠️ Create a camp first to enable patient registration
            </p>
          )}
        </CardContent>
      </Card>

      {/* 4️⃣ Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR No</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPatients.map((patient) => (
                  <TableRow 
                    key={patient.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/patients/${patient.id}/history`)}
                  >
                    <TableCell className="font-mono text-sm">{patient.patientId}</TableCell>
                    <TableCell className="font-medium">
                      {patient.name} {patient.surname}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          patient.status === 'Completed' ? 'default' :
                          patient.status === 'At Doctor' ? 'secondary' :
                          'outline'
                        }
                        className={cn(
                          patient.status === 'Completed' && 'bg-green-100 text-green-800 hover:bg-green-100',
                          patient.status === 'At Doctor' && 'bg-orange-100 text-orange-800',
                          patient.status === 'At Pharmacy' && 'bg-teal-100 text-teal-800',
                          patient.status === 'At Cashier' && 'bg-blue-100 text-blue-800',
                          patient.status === 'Waiting' && 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {patient.lastUpdated}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No patients registered yet</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/patients/new')}
                className="mt-2"
              >
                Register your first patient
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Stethoscope, Pill, DollarSign, Package, 
  TrendingUp, Building2, Calendar, BarChart3 
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCamps, mockPatients, mockConsultations, mockPrescriptions, mockPayments } from '@/data/mockData';

export default function ReportsHub() {
  const navigate = useNavigate();

  // Calculate summary stats
  const totalPatients = mockPatients.length;
  const totalConsultations = mockConsultations.length;
  const totalPrescriptions = mockPrescriptions.length;
  const totalCollection = mockPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const pendingPayments = mockPayments.reduce((sum, p) => sum + p.pendingAmount, 0);

  const reportCards = [
    {
      title: 'Camps Report',
      description: 'View all camps with status and summary',
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
      stats: `${mockCamps.length} total camps`,
      path: '/reports/camps',
    },
    {
      title: 'Patients Report',
      description: 'Camp-wise patient count and list',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      stats: `${totalPatients} total patients`,
      path: '/reports/patients',
    },
    {
      title: 'Consultation Report',
      description: 'Doctor-wise consultations summary',
      icon: Stethoscope,
      color: 'bg-purple-100 text-purple-600',
      stats: `${totalConsultations} consultations`,
      path: '/reports/consultations',
    },
    {
      title: 'Medicine Usage Report',
      description: 'Medicines dispensed and usage stats',
      icon: Pill,
      color: 'bg-orange-100 text-orange-600',
      stats: `${totalPrescriptions} prescriptions`,
      path: '/reports/medicines',
    },
    {
      title: 'Payment Report',
      description: 'Collection and pending payments',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-600',
      stats: `₹${totalCollection} collected`,
      path: '/reports/payments',
    },
    {
      title: 'Stock Report',
      description: 'Camp-wise stock and inventory',
      icon: Package,
      color: 'bg-teal-100 text-teal-600',
      stats: 'View stock levels',
      path: '/stock',
    },
  ];

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPatients}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalConsultations}</p>
                <p className="text-sm text-muted-foreground">Consultations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalCollection}</p>
                <p className="text-sm text-muted-foreground">Collection</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{pendingPayments}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(report.path)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <p className="text-sm font-medium text-accent mt-2">{report.stats}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Camp-wise Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Camp-wise Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="data-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Camp Name</th>
                  <th>Status</th>
                  <th>Patients</th>
                  <th>Consultations</th>
                  <th>Collection</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {mockCamps.map(camp => {
                  const campPatients = mockPatients.filter(p => p.campId === camp.id).length;
                  const campConsultations = mockConsultations.filter(c => c.campId === camp.id).length;
                  const campPayments = mockPayments.filter(p => p.campId === camp.id);
                  const campCollection = campPayments.reduce((sum, p) => sum + p.paidAmount, 0);
                  const campPending = campPayments.reduce((sum, p) => sum + p.pendingAmount, 0);
                  
                  return (
                    <tr key={camp.id}>
                      <td className="font-medium">{camp.name}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          camp.status === 'active' ? 'bg-green-100 text-green-700' :
                          camp.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                      <td>{campPatients}</td>
                      <td>{campConsultations}</td>
                      <td className="text-green-600 font-medium">₹{campCollection}</td>
                      <td className="text-red-600">₹{campPending}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

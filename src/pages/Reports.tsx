import { FileText, Download, Users, Tent, Pill, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const reportTypes = [
  {
    id: 'camps',
    title: 'Total Camps List',
    description: 'View all camps with patient counts and status',
    icon: Tent,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'patients',
    title: 'Camp-wise Patient Report',
    description: 'Patient statistics grouped by camp',
    icon: Users,
    color: 'bg-green-100 text-green-700',
  },
  {
    id: 'consultations',
    title: 'Doctor Consultation Report',
    description: 'Consultations performed by each doctor',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'medicines',
    title: 'Medicine Dispensing Report',
    description: 'Medicines dispensed per camp',
    icon: Pill,
    color: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'payments',
    title: 'Payment Collection Report',
    description: 'Full, partial, and pending payments',
    icon: CreditCard,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'stock',
    title: 'Stock Report',
    description: 'Camp-wise medicine stock levels',
    icon: Pill,
    color: 'bg-pink-100 text-pink-700',
  },
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Summary</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">3</p>
                <p className="text-sm text-muted-foreground">Total Camps</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">1,245</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">856</p>
                <p className="text-sm text-muted-foreground">Consultations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">₹1.2L</p>
                <p className="text-sm text-muted-foreground">Total Collection</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

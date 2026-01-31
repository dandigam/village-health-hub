import { useNavigate } from 'react-router-dom';
import { 
  Users, Stethoscope, Pill, DollarSign, 
  TrendingUp, Building2, Percent, ArrowRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { mockCamps, mockPatients, mockConsultations, mockPrescriptions, mockPayments, mockDiscounts, mockDoctors } from '@/data/mockData';

export default function ReportsHub() {
  const navigate = useNavigate();

  // Calculate summary stats
  const totalPatients = mockPatients.length;
  const totalConsultations = mockConsultations.length;
  const totalCollection = mockPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const pendingPayments = mockPayments.reduce((sum, p) => sum + p.pendingAmount, 0);
  const totalDiscounts = mockDiscounts.reduce((sum, d) => d.type === 'fixed' ? sum + d.value : sum, 0);

  const reportModules = [
    {
      title: 'Camp-Based Reports',
      description: 'Patients, medicines, discounts, doctors & expenses by camp',
      icon: Building2,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      stats: [
        { label: 'Total Camps', value: mockCamps.length },
        { label: 'Active', value: mockCamps.filter(c => c.status === 'active').length },
      ],
      path: '/reports/camps',
    },
    {
      title: 'Patient-Based Reports',
      description: 'Camps attended, medicines, consultations & visit history',
      icon: Users,
      color: 'bg-green-500',
      bgLight: 'bg-green-50',
      stats: [
        { label: 'Total Patients', value: totalPatients },
        { label: 'Consultations', value: totalConsultations },
      ],
      path: '/reports/patients',
    },
    {
      title: 'Medicine-Based Reports',
      description: 'Distribution by camp, patient prescriptions & discounts',
      icon: Pill,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      stats: [
        { label: 'Medicines', value: mockPrescriptions.reduce((sum, p) => sum + p.items.length, 0) },
        { label: 'Prescriptions', value: mockPrescriptions.length },
      ],
      path: '/reports/medicines',
    },
    {
      title: 'Discount-Based Reports',
      description: 'Camps, patients & medicines linked to discounts',
      icon: Percent,
      color: 'bg-teal-500',
      bgLight: 'bg-teal-50',
      stats: [
        { label: 'Discounts Applied', value: mockDiscounts.length },
        { label: 'Total Value', value: `₹${totalDiscounts}` },
      ],
      path: '/reports/discounts',
    },
    {
      title: 'Doctor-Based Reports',
      description: 'Camps attended, patients consulted & prescriptions',
      icon: Stethoscope,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      stats: [
        { label: 'Doctors', value: mockDoctors.length },
        { label: 'Consultations', value: totalConsultations },
      ],
      path: '/reports/doctors',
    },
  ];

  return (
    <DashboardLayout campName="Reports">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">History & Reporting Module</h1>
          <p className="text-sm text-muted-foreground">Comprehensive analytics and historical data</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{totalPatients}</p>
                  <p className="text-[10px] text-muted-foreground">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{totalConsultations}</p>
                  <p className="text-[10px] text-muted-foreground">Consultations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">₹{totalCollection}</p>
                  <p className="text-[10px] text-muted-foreground">Collection</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">₹{pendingPayments}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">₹{totalDiscounts}</p>
                  <p className="text-[10px] text-muted-foreground">Discounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Modules */}
        <div className="grid grid-cols-1 gap-3">
          {reportModules.map((module, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => navigate(module.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${module.color} flex items-center justify-center shrink-0`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{module.title}</h3>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    {module.stats.map((stat, idx) => (
                      <div key={idx} className={`px-3 py-1.5 rounded-lg ${module.bgLight}`}>
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

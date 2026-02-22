import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  CreditCard,
  Users,
  ClipboardList,
  Activity,
  DollarSign,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  usePrescriptions,
  usePayments,
  useMedicines,
  usePatients,
} from '@/hooks/useApiData';
import { cn } from '@/lib/utils';

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function PharmacyDashboardOverview() {
  const navigate = useNavigate();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: payments = [] } = usePayments();
  const { data: medicines = [] } = useMedicines();
  const { data: patientsRaw = [] } = usePatients();

  const patientList = Array.isArray((patientsRaw as any).content)
    ? (patientsRaw as any).content
    : Array.isArray(patientsRaw) ? patientsRaw : [];

  const pendingRx = prescriptions.filter(p => p.status === 'pending').length;
  const dispensedRx = prescriptions.filter(p => p.status === 'dispensed').length;
  const partialRx = prescriptions.filter(p => p.status === 'partial').length;
  const totalCollection = payments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const pendingPayments = payments.reduce((sum, p) => sum + (p.pendingAmount || 0), 0);
  const totalPatients = patientList.length;

  const quickLinks = [
    { label: 'Dispense', icon: Pill, href: '/pharmacy', color: 'text-stat-teal-text', bg: 'bg-stat-teal' },
    { label: 'Prescriptions', icon: FileText, href: '/pharmacy', color: 'text-stat-blue-text', bg: 'bg-stat-blue' },
    { label: 'Patients', icon: Users, href: '/patients', color: 'text-stat-green-text', bg: 'bg-stat-green' },
    { label: 'Reports', icon: ClipboardList, href: '/reports/medicines', color: 'text-stat-purple-text', bg: 'bg-stat-purple' },
  ];

  const recentPrescriptions = prescriptions.slice(0, 5);

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Pharmacy Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Dispensing & billing overview</p>
          </div>
          <Button size="sm" onClick={() => navigate('/pharmacy')}>
            <Pill className="mr-1.5 h-3.5 w-3.5" />
            Open Pharmacy
          </Button>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left',
                link.bg, 'border-transparent'
              )}
            >
              <div className="p-1.5 rounded-lg bg-white/60">
                <link.icon className={cn('h-4 w-4', link.color)} />
              </div>
              <span className={cn('text-sm font-semibold', link.color)}>{link.label}</span>
              <ArrowRight className={cn('h-3.5 w-3.5 ml-auto opacity-50', link.color)} />
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-teal to-stat-teal/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-teal-text/70 uppercase tracking-wide">Pending Rx</p>
                  <p className="text-2xl font-bold text-stat-teal-text mt-0.5">{pendingRx}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-teal-text/10">
                  <Clock className="h-5 w-5 text-stat-teal-text" />
                </div>
              </div>
              {pendingRx > 0 && (
                <p className="text-[10px] text-stat-teal-text/60 mt-2 flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Awaiting dispensing
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-green to-stat-green/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-green-text/70 uppercase tracking-wide">Dispensed</p>
                  <p className="text-2xl font-bold text-stat-green-text mt-0.5">{dispensedRx}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-green-text/10">
                  <CheckCircle2 className="h-5 w-5 text-stat-green-text" />
                </div>
              </div>
              <p className="text-[10px] text-stat-green-text/60 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Completed today
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-blue to-stat-blue/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-blue-text/70 uppercase tracking-wide">Collection</p>
                  <p className="text-2xl font-bold text-stat-blue-text mt-0.5">₹{totalCollection.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-blue-text/10">
                  <DollarSign className="h-5 w-5 text-stat-blue-text" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-pink to-stat-pink/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-pink-text/70 uppercase tracking-wide">Pending ₹</p>
                  <p className="text-2xl font-bold text-stat-pink-text mt-0.5">₹{pendingPayments.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-pink-text/10">
                  <CreditCard className="h-5 w-5 text-stat-pink-text" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Prescription Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Prescription Status</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/pharmacy')}>
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-orange-text/10">
                      <Clock className="h-3.5 w-3.5 text-stat-orange-text" />
                    </div>
                    <span className="text-sm text-foreground">Pending</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-orange text-stat-orange-text font-bold text-xs">
                    {pendingRx}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-purple-text/10">
                      <AlertCircle className="h-3.5 w-3.5 text-stat-purple-text" />
                    </div>
                    <span className="text-sm text-foreground">Partial</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-purple text-stat-purple-text font-bold text-xs">
                    {partialRx}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-green-text/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-stat-green-text" />
                    </div>
                    <span className="text-sm text-foreground">Dispensed</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-green text-stat-green-text font-bold text-xs">
                    {dispensedRx}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Summary</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-blue-text/10">
                      <Users className="h-3.5 w-3.5 text-stat-blue-text" />
                    </div>
                    <span className="text-sm text-foreground">Patients Served</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-blue text-stat-blue-text font-bold text-xs">
                    {totalPatients}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-teal-text/10">
                      <Pill className="h-3.5 w-3.5 text-stat-teal-text" />
                    </div>
                    <span className="text-sm text-foreground">Medicines Available</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-teal text-stat-teal-text font-bold text-xs">
                    {medicines.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-green-text/10">
                      <FileText className="h-3.5 w-3.5 text-stat-green-text" />
                    </div>
                    <span className="text-sm text-foreground">Total Prescriptions</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-green text-stat-green-text font-bold text-xs">
                    {prescriptions.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}

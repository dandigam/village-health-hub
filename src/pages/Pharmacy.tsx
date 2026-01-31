import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle } from 'lucide-react';

const mockPrescriptions = [
  {
    id: '1',
    patientName: 'Rama Krishna',
    patientId: 'BPTL-OCT0718-7225',
    doctorName: 'Dr. Ramesh Naidu',
    items: 5,
    status: 'pending',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    patientName: 'Ramana Babu',
    patientId: 'BPTL-OCT0718-7226',
    doctorName: 'Dr. Priya Sharma',
    items: 3,
    status: 'pending',
    createdAt: '2025-01-15T11:00:00Z',
  },
  {
    id: '3',
    patientName: 'Gali Anjamma',
    patientId: 'BPTL-DEC0218-9248',
    doctorName: 'Dr. Ramesh Naidu',
    items: 8,
    status: 'dispensed',
    createdAt: '2025-01-15T09:00:00Z',
  },
];

export default function Pharmacy() {
  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <h1 className="page-title">Pharmacy</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending Prescriptions</TabsTrigger>
          <TabsTrigger value="dispensed">Dispensed</TabsTrigger>
          <TabsTrigger value="stock">Stock Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {mockPrescriptions
              .filter((p) => p.status === 'pending')
              .map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-accent font-semibold">
                            {prescription.patientName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{prescription.patientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prescription.patientId} • {prescription.items} medicines
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Prescribed by {prescription.doctorName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="bg-accent hover:bg-accent/90">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Dispense
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="dispensed">
          <div className="grid gap-4">
            {mockPrescriptions
              .filter((p) => p.status === 'dispensed')
              .map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{prescription.patientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {prescription.patientId} • {prescription.items} medicines
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Dispensed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stock management features will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

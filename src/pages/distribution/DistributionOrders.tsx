import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RequestOrdersList } from '@/components/stock/distribution/RequestOrdersList';
import { DistributionHistory } from '@/components/stock/distribution/DistributionHistory';

export default function DistributionOrders() {
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Distribution Orders</h1>
      </div>
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Request Orders</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <RequestOrdersList />
        </TabsContent>
        <TabsContent value="history">
          <DistributionHistory />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

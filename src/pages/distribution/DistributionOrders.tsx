import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RequestOrdersList } from '@/components/stock/distribution/RequestOrdersList';
import { DistributionHistory } from '@/components/stock/distribution/DistributionHistory';
import { ArrowRightLeft, FileText, History } from 'lucide-react';

export default function DistributionOrders() {
  return (
    <DashboardLayout>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">Distribution Orders</h1>
          <p className="text-[11px] text-muted-foreground">Manage stock requests and track fulfillment</p>
        </div>
      </div>
      <Tabs defaultValue="requests" className="space-y-3">
        <TabsList className="h-9">
          <TabsTrigger value="requests" className="text-xs gap-1.5">
            <FileText className="h-3 w-3" /> Request Orders
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5">
            <History className="h-3 w-3" /> History
          </TabsTrigger>
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

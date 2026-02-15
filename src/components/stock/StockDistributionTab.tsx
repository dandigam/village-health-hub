import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RequestOrdersList } from './distribution/RequestOrdersList';
import { DistributionHistory } from './distribution/DistributionHistory';

export function StockDistributionTab() {
  return (
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
  );
}

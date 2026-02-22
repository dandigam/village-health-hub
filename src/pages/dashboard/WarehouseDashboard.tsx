import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  ShoppingCart,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Boxes,
  BarChart3,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useStockItems,
  useSuppliers,
  useSupplierOrders,
  useDistributions,
  useRequestOrders,
  useWarehouses,
  useWarehouseInventory,
} from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const warehouseId = user?.wareHouse?.id ? Number(user.wareHouse.id) : undefined;

  const { data: stockItems = [] } = useStockItems();
  const { data: suppliers = [] } = useSuppliers();
  const { data: supplierOrders = [] } = useSupplierOrders(warehouseId);
  const { data: distributions = [] } = useDistributions();
  const { data: requestOrders = [] } = useRequestOrders();
  const { data: warehouses = [] } = useWarehouses();
  const { data: inventory = [] } = useWarehouseInventory(warehouseId);

  const pendingOrders = supplierOrders.filter(o => o.status === 'pending' || o.status === 'sent').length;
  const receivedOrders = supplierOrders.filter(o => o.status === 'received').length;
  const pendingRequests = requestOrders.filter(o => o.status === 'pending' || o.status === 'draft').length;
  const completedDistributions = distributions.filter(d => d.status === 'confirmed' || d.status === 'sent').length;
  const lowStockItems = inventory.filter(item => item.totalQty <= item.minimumQty).length;
  const totalMedicines = inventory.length;

  const quickLinks = [
    { label: 'Inventory', icon: Package, href: '/stock', color: 'text-stat-blue-text', bg: 'bg-stat-blue' },
    { label: 'Suppliers', icon: Truck, href: '/suppliers', color: 'text-stat-green-text', bg: 'bg-stat-green' },
    { label: 'Orders', icon: ShoppingCart, href: '/supplier-orders', color: 'text-stat-orange-text', bg: 'bg-stat-orange' },
    { label: 'Distribution', icon: ArrowRightLeft, href: '/distribution-orders', color: 'text-stat-purple-text', bg: 'bg-stat-purple' },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Warehouse Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.wareHouse?.name || 'Warehouse'} • Real-time inventory overview
            </p>
          </div>
          <Button size="sm" onClick={() => navigate('/supplier-orders')}>
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            New Order
          </Button>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left',
                link.bg, 'border-transparent'
              )}
            >
              <div className={cn('p-1.5 rounded-lg bg-white/60')}>
                <link.icon className={cn('h-4 w-4', link.color)} />
              </div>
              <span className={cn('text-sm font-semibold', link.color)}>{link.label}</span>
              <ArrowRight className={cn('h-3.5 w-3.5 ml-auto opacity-50', link.color)} />
            </button>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-blue to-stat-blue/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-blue-text/70 uppercase tracking-wide">Total Medicines</p>
                  <p className="text-2xl font-bold text-stat-blue-text mt-0.5">{totalMedicines}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-blue-text/10">
                  <Boxes className="h-5 w-5 text-stat-blue-text" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-orange to-stat-orange/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-orange-text/70 uppercase tracking-wide">Low Stock</p>
                  <p className="text-2xl font-bold text-stat-orange-text mt-0.5">{lowStockItems}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-orange-text/10">
                  <AlertTriangle className="h-5 w-5 text-stat-orange-text" />
                </div>
              </div>
              {lowStockItems > 0 && (
                <p className="text-[10px] text-stat-orange-text/60 mt-2 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Needs reorder
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-green to-stat-green/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-green-text/70 uppercase tracking-wide">Suppliers</p>
                  <p className="text-2xl font-bold text-stat-green-text mt-0.5">{suppliers.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-green-text/10">
                  <Truck className="h-5 w-5 text-stat-green-text" />
                </div>
              </div>
              <p className="text-[10px] text-stat-green-text/60 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Active partners
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-purple to-stat-purple/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-stat-purple-text/70 uppercase tracking-wide">Warehouses</p>
                  <p className="text-2xl font-bold text-stat-purple-text mt-0.5">{warehouses.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-stat-purple-text/10">
                  <BarChart3 className="h-5 w-5 text-stat-purple-text" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders & Distribution Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Supplier Orders Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Supplier Orders</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/supplier-orders')}>
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-orange-text/10">
                      <Clock className="h-3.5 w-3.5 text-stat-orange-text" />
                    </div>
                    <span className="text-sm text-foreground">Pending Orders</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-orange text-stat-orange-text font-bold text-xs">
                    {pendingOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-green-text/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-stat-green-text" />
                    </div>
                    <span className="text-sm text-foreground">Received</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-green text-stat-green-text font-bold text-xs">
                    {receivedOrders}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-blue-text/10">
                      <ShoppingCart className="h-3.5 w-3.5 text-stat-blue-text" />
                    </div>
                    <span className="text-sm text-foreground">Total Orders</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-blue text-stat-blue-text font-bold text-xs">
                    {supplierOrders.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Distribution</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/distribution-orders')}>
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-pink-text/10">
                      <Clock className="h-3.5 w-3.5 text-stat-pink-text" />
                    </div>
                    <span className="text-sm text-foreground">Pending Requests</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-pink text-stat-pink-text font-bold text-xs">
                    {pendingRequests}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-teal-text/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-stat-teal-text" />
                    </div>
                    <span className="text-sm text-foreground">Completed</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-teal text-stat-teal-text font-bold text-xs">
                    {completedDistributions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-stat-purple-text/10">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-stat-purple-text" />
                    </div>
                    <span className="text-sm text-foreground">Total Distributions</span>
                  </div>
                  <Badge variant="secondary" className="bg-stat-purple text-stat-purple-text font-bold text-xs">
                    {distributions.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert Table */}
        {lowStockItems > 0 && (
          <motion.div variants={fadeUp}>
            <Card className="border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-foreground">Low Stock Alerts</h3>
                  <Badge variant="destructive" className="text-[10px] ml-auto">{lowStockItems} items</Badge>
                </div>
                <div className="space-y-1.5">
                  {inventory
                    .filter(item => item.totalQty <= item.minimumQty)
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 text-sm">
                        <span className="font-medium text-foreground">{item.medicineName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">Min: {item.minimumQty}</span>
                          <Badge variant="destructive" className="text-[10px]">
                            {item.totalQty} left
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

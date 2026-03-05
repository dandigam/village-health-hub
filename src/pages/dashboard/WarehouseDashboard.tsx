import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Truck, ShoppingCart, ArrowRightLeft, TrendingDown, AlertTriangle,
  Clock, CheckCircle2, ArrowRight, Boxes, TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  useDistributions, useRequestOrders, useWarehouseInventory, useWarehouseDashboardStats,
} from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const warehouseId = user?.context?.warehouseId ? Number(user.context.warehouseId) : undefined;

  const { data: dashStats, refetch } = useWarehouseDashboardStats(warehouseId);
  const alertShownRef = useRef(false);
  useEffect(() => { refetch(); }, [warehouseId]);

  const { data: distributions = [] } = useDistributions();
  const { data: requestOrders = [] } = useRequestOrders();
  const { data: inventory = [] } = useWarehouseInventory(warehouseId);

  const totalMedicines = dashStats?.totalMedicines ?? 0;
  const lowStockCount = dashStats?.lowStock ?? 0;
  const suppliersCount = dashStats?.suppliers ?? 0;
  const pendingOrders = dashStats?.supplierOrders?.pendingOrders ?? 0;
  const receivedOrders = dashStats?.supplierOrders?.received ?? 0;
  const totalOrders = dashStats?.supplierOrders?.totalOrders ?? 0;

  const pendingRequests = requestOrders.filter(o => o.status === 'pending' || o.status === 'draft').length;
  const completedDistributions = distributions.filter(d => d.status === 'confirmed' || d.status === 'sent').length;

  const quickLinks = [
    { label: 'Inventory', icon: Package, href: '/stock', color: 'text-stat-blue-text', bg: 'bg-stat-blue', borderColor: 'border-[hsl(var(--stat-blue-text)/0.12)]' },
    { label: 'Suppliers', icon: Truck, href: '/suppliers', color: 'text-stat-green-text', bg: 'bg-stat-green', borderColor: 'border-[hsl(var(--stat-green-text)/0.12)]' },
    { label: 'Orders', icon: ShoppingCart, href: '/supplier-orders', color: 'text-stat-orange-text', bg: 'bg-stat-orange', borderColor: 'border-[hsl(var(--stat-orange-text)/0.12)]' },
    { label: 'Distribution', icon: ArrowRightLeft, href: '/distribution-orders', color: 'text-stat-purple-text', bg: 'bg-stat-purple', borderColor: 'border-[hsl(var(--stat-purple-text)/0.12)]' },
  ];

  // Show low stock alert toast on first load
  const lowStockItems = inventory.filter(item => item.totalQty <= item.minimumQty);
  useEffect(() => {
    if (!alertShownRef.current && lowStockItems.length > 0) {
      alertShownRef.current = true;
      toast.warning(`⚠️ ${lowStockItems.length} medicine(s) are running low on stock!`, {
        description: 'Click to view low stock items',
        duration: 8000,
        action: {
          label: 'View Stock',
          onClick: () => navigate('/stock'),
        },
      });
    }
  }, [lowStockItems.length, navigate]);

  // Calculate stock health percentage
  const stockHealthPct = totalMedicines > 0 ? Math.round(((totalMedicines - lowStockCount) / totalMedicines) * 100) : 100;
  const orderFulfillmentPct = totalOrders > 0 ? Math.round((receivedOrders / totalOrders) * 100) : 0;

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Warehouse Dashboard</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Real-time inventory & operations overview</p>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={() => navigate('/supplier-orders')}>
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> New Order
          </Button>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className={cn(
                'flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left group',
                link.bg, link.borderColor
              )}
            >
              <div className="p-1.5 rounded-lg bg-white/60 group-hover:bg-white/80 transition-colors">
                <link.icon className={cn('h-4 w-4', link.color)} />
              </div>
              <span className={cn('text-sm font-semibold', link.color)}>{link.label}</span>
              <ArrowRight className={cn('h-3.5 w-3.5 ml-auto opacity-30 group-hover:opacity-70 transition-opacity', link.color)} />
            </button>
          ))}
        </motion.div>

        {/* Stats Grid — 3 stat cards + health indicator */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Medicines */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-blue to-stat-blue/40 overflow-hidden relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-stat-blue-text/60 uppercase tracking-wider">Total Medicines</p>
                  <p className="text-2xl font-bold text-stat-blue-text mt-0.5">{totalMedicines}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-stat-blue-text/50">Stock health</span>
                    <span className="text-[10px] font-bold text-stat-blue-text">{stockHealthPct}%</span>
                  </div>
                  <Progress value={stockHealthPct} className="h-1 mt-1 w-24 bg-stat-blue-text/10 [&>div]:bg-stat-blue-text/50" />
                </div>
                <div className="p-2.5 rounded-xl bg-stat-blue-text/8">
                  <Boxes className="h-5 w-5 text-stat-blue-text" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock */}
          <Card className={cn("border-0 shadow-sm overflow-hidden relative cursor-pointer hover:shadow-md transition-shadow", lowStockCount > 0 ? "bg-gradient-to-br from-stat-orange to-stat-orange/40" : "bg-gradient-to-br from-stat-green to-stat-green/40")} onClick={() => lowStockCount > 0 && navigate('/stock')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-[10px] font-semibold uppercase tracking-wider", lowStockCount > 0 ? "text-stat-orange-text/60" : "text-stat-green-text/60")}>Low Stock</p>
                  <p className={cn("text-2xl font-bold mt-0.5", lowStockCount > 0 ? "text-stat-orange-text" : "text-stat-green-text")}>{lowStockCount}</p>
                  {lowStockCount > 0 && (
                    <p className="text-[10px] text-stat-orange-text/50 mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Needs reorder
                    </p>
                  )}
                </div>
                <div className={cn("p-2.5 rounded-xl", lowStockCount > 0 ? "bg-stat-orange-text/8" : "bg-stat-green-text/8")}>
                  {lowStockCount > 0 ? <AlertTriangle className="h-5 w-5 text-stat-orange-text" /> : <CheckCircle2 className="h-5 w-5 text-stat-green-text" />}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-stat-green to-stat-green/40 overflow-hidden relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-stat-green-text/60 uppercase tracking-wider">Suppliers</p>
                  <p className="text-2xl font-bold text-stat-green-text mt-0.5">{suppliersCount}</p>
                  <p className="text-[10px] text-stat-green-text/50 mt-1.5 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Active partners
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-stat-green-text/8">
                  <Truck className="h-5 w-5 text-stat-green-text" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders & Distribution Row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Supplier Orders Summary */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Supplier Orders</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/supplier-orders')}>
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 space-y-1.5">
                {/* Fulfillment progress */}
                <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                  <span className="text-muted-foreground">Order Fulfillment</span>
                  <span className="font-semibold text-foreground">{orderFulfillmentPct}%</span>
                </div>
                <Progress value={orderFulfillmentPct} className="h-1.5 mx-2 mb-2 bg-muted [&>div]:bg-primary" />

                {[
                  { label: 'Pending Orders', count: pendingOrders, icon: Clock, dot: 'bg-amber-500 animate-pulse', color: 'text-stat-orange-text', bg: 'bg-stat-orange' },
                  { label: 'Received', count: receivedOrders, icon: CheckCircle2, dot: 'bg-emerald-500', color: 'text-stat-green-text', bg: 'bg-stat-green' },
                  { label: 'Total Orders', count: totalOrders, icon: ShoppingCart, dot: 'bg-blue-500', color: 'text-stat-blue-text', bg: 'bg-stat-blue' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-background">
                        <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                      </div>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                      <Badge variant="secondary" className={cn('font-bold text-xs', item.bg, item.color)}>
                        {item.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribution Summary */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Distribution</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate('/distribution-orders')}>
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="p-3 space-y-1.5">
                {[
                  { label: 'Pending Requests', count: pendingRequests, icon: Clock, dot: 'bg-amber-500 animate-pulse', color: 'text-stat-pink-text', bg: 'bg-stat-pink' },
                  { label: 'Completed', count: completedDistributions, icon: CheckCircle2, dot: 'bg-emerald-500', color: 'text-stat-teal-text', bg: 'bg-stat-teal' },
                  { label: 'Total Distributions', count: distributions.length, icon: ArrowRightLeft, dot: 'bg-purple-500', color: 'text-stat-purple-text', bg: 'bg-stat-purple' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-background">
                        <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                      </div>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                      <Badge variant="secondary" className={cn('font-bold text-xs', item.bg, item.color)}>
                        {item.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert Table */}
        {lowStockCount > 0 && (
          <motion.div variants={fadeUp}>
            <Card className="border-destructive/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-semibold text-foreground">Low Stock Alerts</h3>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">{lowStockCount} items</Badge>
                </div>
                <div className="p-3 space-y-1.5">
                  {inventory
                    .filter(item => item.totalQty <= item.minimumQty)
                    .slice(0, 5)
                    .map((item) => {
                      const pct = item.minimumQty > 0 ? Math.round((item.totalQty / item.minimumQty) * 100) : 0;
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer" onClick={() => navigate('/stock')}>
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-destructive/10">
                              <Package className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{item.medicineName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-16">
                              <Progress value={pct} className="h-1.5 bg-destructive/10 [&>div]:bg-destructive" />
                            </div>
                            <span className="text-[10px] text-muted-foreground w-14 text-right">Min: {item.minimumQty}</span>
                            <Badge variant="destructive" className="text-[10px] min-w-[48px] justify-center">
                              {item.totalQty} left
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

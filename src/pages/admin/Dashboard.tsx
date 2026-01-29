import { Package, FolderOpen, ShoppingCart, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, categories, orders] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total, status'),
      ]);

      const totalRevenue = orders.data?.reduce(
        (sum, order) => sum + (order.status === 'completed' ? Number(order.total) : 0),
        0
      ) || 0;

      const pendingOrders = orders.data?.filter(o => o.status === 'pending').length || 0;

      return {
        productsCount: products.count || 0,
        categoriesCount: categories.count || 0,
        ordersCount: orders.data?.length || 0,
        pendingOrders,
        totalRevenue,
      };
    },
  });

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.productsCount || 0,
      icon: Package,
      color: 'from-primary/20 to-primary/10',
    },
    {
      label: 'Categories',
      value: stats?.categoriesCount || 0,
      icon: FolderOpen,
      color: 'from-accent/20 to-accent/10',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'from-warning/20 to-warning/10',
    },
    {
      label: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-success/20 to-success/10',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          : statCards.map((stat) => (
              <div key={stat.label} className="glass-card p-6">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="h-6 w-6 text-foreground" />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/products"
            className="glass-card p-4 hover:border-primary/50 transition-colors"
          >
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium">Manage Products</p>
            <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
          </a>
          <a
            href="/admin/orders"
            className="glass-card p-4 hover:border-primary/50 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium">View Orders</p>
            <p className="text-sm text-muted-foreground">Process pending orders</p>
          </a>
          <a
            href="/admin/theme"
            className="glass-card p-4 hover:border-primary/50 transition-colors"
          >
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium">Customize Theme</p>
            <p className="text-sm text-muted-foreground">Change colors and layout</p>
          </a>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string | null;
  created_at: string;
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'text-warning',
  completed: 'text-success',
  cancelled: 'text-destructive',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="section-container">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              const statusColor = statusColors[order.status] || 'text-muted-foreground';

              return (
                <div key={order.id} className="glass-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {order.payment_method && (
                        <span className="crypto-badge">
                          {order.payment_method}
                        </span>
                      )}
                      
                      <div className={`flex items-center gap-2 ${statusColor}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="capitalize font-medium">{order.status}</span>
                      </div>

                      <p className="text-xl font-bold text-primary">
                        ${Number(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Button asChild className="glow-primary">
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

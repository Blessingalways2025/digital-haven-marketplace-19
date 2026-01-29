import { ShoppingCart, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  payment_method: string | null;
  payment_address: string | null;
  transaction_hash: string | null;
  created_at: string;
  profiles?: { email: string | null } | null;
}

const statusOptions = ['pending', 'completed', 'cancelled'];

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

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', order.user_id)
            .maybeSingle();
          
          return { ...order, profiles: profile };
        })
      );
      
      return ordersWithProfiles as Order[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Order updated' });
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.email || 'Unknown user'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {order.payment_method && (
                      <span className="crypto-badge">{order.payment_method}</span>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateMutation.mutate({ id: order.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-xl font-bold text-primary">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.transaction_hash && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tx Hash:</span>{' '}
                      <code className="text-xs">{order.transaction_hash}</code>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          No orders yet.
        </div>
      )}
    </div>
  );
}

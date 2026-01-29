import { useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface CryptoWallet {
  id: string;
  currency: string;
  address: string;
  network: string | null;
  is_active: boolean;
}

export default function AdminWallets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .order('currency', { ascending: true });

      if (error) throw error;
      return data as CryptoWallet[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (wallet: {
      currency: string;
      address: string;
      network: string | null;
      is_active: boolean;
    }) => {
      if (editingWallet) {
        const { error } = await supabase
          .from('crypto_wallets')
          .update(wallet)
          .eq('id', editingWallet.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('crypto_wallets').insert([wallet]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['crypto-wallets'] });
      setDialogOpen(false);
      setEditingWallet(null);
      toast({ title: editingWallet ? 'Wallet updated' : 'Wallet created' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crypto_wallets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['crypto-wallets'] });
      toast({ title: 'Wallet deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const wallet = {
      currency: (formData.get('currency') as string).toUpperCase(),
      address: formData.get('address') as string,
      network: formData.get('network') as string || null,
      is_active: formData.get('is_active') === 'on',
    };

    saveMutation.mutate(wallet);
  };

  const openEdit = (wallet: CryptoWallet) => {
    setEditingWallet(wallet);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingWallet(null);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Crypto Wallets</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWallet ? 'Edit Wallet' : 'Add Wallet'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  placeholder="BTC"
                  defaultValue={editingWallet?.currency}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Your wallet address"
                  defaultValue={editingWallet?.address}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Input
                  id="network"
                  name="network"
                  placeholder="e.g., Bitcoin, TRC20"
                  defaultValue={editingWallet?.network || ''}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingWallet?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Wallet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : wallets && wallets.length > 0 ? (
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="glass-card p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="crypto-badge">{wallet.currency}</span>
                  {wallet.network && (
                    <span className="text-xs text-muted-foreground">
                      {wallet.network}
                    </span>
                  )}
                  {!wallet.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm font-mono text-muted-foreground truncate mt-1">
                  {wallet.address}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(wallet)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => deleteMutation.mutate(wallet.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          No wallets configured. Click "Add Wallet" to create one.
        </div>
      )}
    </div>
  );
}

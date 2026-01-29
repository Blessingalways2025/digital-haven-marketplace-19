import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CryptoWallet {
  id: string;
  currency: string;
  address: string;
  network: string | null;
  is_active: boolean;
}

export function useCryptoWallets() {
  return useQuery({
    queryKey: ['crypto-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as CryptoWallet[];
    },
  });
}

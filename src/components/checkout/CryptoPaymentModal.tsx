import { useState } from 'react';
import { Copy, Check, Bitcoin, Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCryptoWallets, type CryptoWallet } from '@/hooks/useCryptoWallets';

interface CryptoPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onPaymentSubmit: (wallet: CryptoWallet) => void;
}

const cryptoIcons: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  LTC: 'Ł',
};

export function CryptoPaymentModal({
  open,
  onOpenChange,
  totalAmount,
  onPaymentSubmit,
}: CryptoPaymentModalProps) {
  const { data: wallets, isLoading } = useCryptoWallets();
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Crypto Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="text-2xl font-bold gradient-text">
              ${totalAmount.toFixed(2)} USD
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Select Payment Method</p>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {wallets?.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => setSelectedWallet(wallet)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedWallet?.id === wallet.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-primary">
                        {cryptoIcons[wallet.currency] || <Bitcoin className="h-5 w-5" />}
                      </span>
                      <div className="text-left">
                        <p className="font-medium">{wallet.currency}</p>
                        <p className="text-xs text-muted-foreground">
                          {wallet.network}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedWallet && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-card p-4">
                <p className="text-sm font-medium mb-2">
                  Send exactly ${totalAmount.toFixed(2)} in {selectedWallet.currency} to:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-background rounded-lg text-sm break-all font-mono">
                    {selectedWallet.address}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(selectedWallet.address)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full glow-primary"
                onClick={() => onPaymentSubmit(selectedWallet)}
              >
                I've Sent the Payment
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

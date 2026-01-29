import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { CryptoPaymentModal } from '@/components/checkout/CryptoPaymentModal';
import type { CryptoWallet } from '@/hooks/useCryptoWallets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setPaymentOpen(true);
  };

  const handlePaymentSubmit = async (wallet: CryptoWallet) => {
    if (!user) return;
    
    setProcessing(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: totalPrice,
          payment_method: wallet.currency,
          payment_address: wallet.address,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      setPaymentOpen(false);
      toast({
        title: 'Order Created',
        description: 'Your order has been placed. We will verify your payment shortly.',
      });
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="section-container">
          <div className="text-center py-16">
            <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any products yet.
            </p>
            <Button asChild className="glow-primary">
              <Link to="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-24 text-right">
                  <p className="font-semibold text-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full glow-primary"
                size="lg"
                onClick={handleCheckout}
                disabled={processing}
              >
                {user ? 'Proceed to Payment' : 'Sign In to Checkout'}
              </Button>

              <div className="mt-4 flex justify-center gap-2">
                <span className="crypto-badge">BTC</span>
                <span className="crypto-badge">ETH</span>
                <span className="crypto-badge">USDT</span>
                <span className="crypto-badge">LTC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CryptoPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        totalAmount={totalPrice}
        onPaymentSubmit={handlePaymentSubmit}
      />
    </Layout>
  );
}

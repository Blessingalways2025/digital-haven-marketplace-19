import { Link } from 'react-router-dom';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export function Footer() {
  const { content } = useStoreSettings();

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="font-bold text-primary-foreground text-sm">DM</span>
              </div>
              <span className="font-semibold text-lg gradient-text">
                DigiMarket
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              {content?.footerText || 'Secure. Fast. Reliable.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h4 className="font-semibold mb-4">Payment Methods</h4>
            <div className="flex flex-wrap gap-2">
              <span className="crypto-badge">BTC</span>
              <span className="crypto-badge">ETH</span>
              <span className="crypto-badge">USDT</span>
              <span className="crypto-badge">LTC</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} DigiMarket. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

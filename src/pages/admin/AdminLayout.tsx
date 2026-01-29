import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  ShoppingCart, 
  Palette, 
  FileText, 
  Wallet,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/theme', label: 'Theme', icon: Palette },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/wallets', label: 'Crypto Wallets', icon: Wallet },
];

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <div className="w-64 bg-sidebar border-r border-sidebar-border p-4">
          <Skeleton className="h-10 w-full mb-8" />
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-sm">DM</span>
            </div>
            <span className="font-semibold text-lg">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => {
            const isActive = link.end 
              ? location.pathname === link.href
              : location.pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

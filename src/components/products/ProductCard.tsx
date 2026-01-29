import { Server, Users, Mail, UserCheck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import type { Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, typeof Server> = {
  Server,
  Users,
  Mail,
  UserCheck,
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const Icon = product.category?.icon 
    ? iconMap[product.category.icon] || Package 
    : Package;

  const stockStatus = product.stock === 0 
    ? 'out-of-stock' 
    : product.stock <= 5 
      ? 'low-stock' 
      : 'in-stock';

  const stockLabel = product.stock === 0 
    ? 'Out of Stock' 
    : product.stock <= 5 
      ? `Only ${product.stock} left` 
      : `${product.stock} in stock`;

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category?.name || 'Uncategorized',
    });
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="glass-card p-6 hover-lift group">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <span className={`stock-badge ${stockStatus}`}>
          {stockLabel}
        </span>
      </div>

      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
      
      {product.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
      )}

      {product.category && (
        <span className="inline-block px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground mb-4">
          {product.category.name}
        </span>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
        
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="glow-primary"
        >
          {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}

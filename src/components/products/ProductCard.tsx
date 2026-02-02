import { useState } from 'react';
import { Server, Users, Mail, UserCheck, Package, Play, Image as ImageIcon } from 'lucide-react';
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
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

  const hasPreview = product.show_preview && (product.image_url || product.video_url);

  return (
    <div className="glass-card overflow-hidden hover-lift group">
      {/* Preview Media Section */}
      {hasPreview && (
        <div className="relative aspect-video bg-secondary/50 overflow-hidden">
          {product.video_url && !isVideoPlaying && product.image_url && (
            <>
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary-foreground ml-1" />
                </div>
              </button>
            </>
          )}
          
          {product.video_url && (isVideoPlaying || !product.image_url) && (
            <video
              src={product.video_url}
              controls
              autoPlay={isVideoPlaying}
              className="w-full h-full object-cover"
            />
          )}
          
          {!product.video_url && product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {!hasPreview && (
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          {hasPreview && <div />}
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
    </div>
  );
}

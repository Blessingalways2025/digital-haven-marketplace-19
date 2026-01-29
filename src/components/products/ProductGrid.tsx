import { ProductCard } from './ProductCard';
import type { Product } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
  layout?: 'grid' | 'list';
}

export function ProductGrid({ products, isLoading, layout = 'grid' }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={layout === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'flex flex-col gap-4'
      }>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card p-6">
            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No products found</p>
      </div>
    );
  }

  return (
    <div className={layout === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
      : 'flex flex-col gap-4'
    }>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category') || undefined;
  
  const { data: products, isLoading } = useProducts(categorySlug);
  const { data: categories } = useCategories();

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <div className="section-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">
            Browse our selection of premium digital products
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          
          <Select
            value={categorySlug || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categorySlug && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
            >
              Clear Filter
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </Layout>
  );
}

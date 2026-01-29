import { Layout } from '@/components/layout/Layout';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <Layout>
      <div className="section-container">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Browse products by category
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6">
                <Skeleton className="h-16 w-16 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

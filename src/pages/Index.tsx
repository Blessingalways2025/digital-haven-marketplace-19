import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Lock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useStoreSettings } from '@/hooks/useStoreSettings';

const features = [
  {
    icon: Shield,
    title: 'Verified Quality',
    description: 'All products are thoroughly tested and verified before listing.',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Get your digital products delivered instantly after payment.',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Multiple cryptocurrency payment options for your privacy.',
  },
  {
    icon: TrendingUp,
    title: 'Fresh Stock',
    description: 'Regular updates with new and fresh inventory daily.',
  },
];

export default function Index() {
  const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { content } = useStoreSettings();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
              <span className="gradient-text">
                {content?.welcomeTitle || 'Digital Marketplace'}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {content?.welcomeSubtitle || 'Premium digital products at your fingertips'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" asChild className="glow-primary">
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/categories">
                  View Categories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-center animate-slide-up"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
          <Button variant="ghost" asChild>
            <Link to="/categories">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-16 w-16 rounded-xl bg-muted mb-4" />
                <div className="h-6 bg-muted rounded mb-2 w-24" />
                <div className="h-4 bg-muted rounded w-full" />
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
      </section>

      {/* Featured Products Section */}
      <section className="section-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <Button variant="ghost" asChild>
            <Link to="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <ProductGrid products={featuredProducts} isLoading={productsLoading} />
      </section>

      {/* CTA Section */}
      <section className="section-container">
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of satisfied customers. Browse our selection of premium digital products today.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="crypto-badge">BTC</span>
              <span className="crypto-badge">ETH</span>
              <span className="crypto-badge">USDT</span>
              <span className="crypto-badge">LTC</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

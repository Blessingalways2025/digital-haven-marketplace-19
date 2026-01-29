import { Link } from 'react-router-dom';
import { Server, Users, Mail, UserCheck, Package } from 'lucide-react';
import type { Category } from '@/hooks/useCategories';

const iconMap: Record<string, typeof Server> = {
  Server,
  Users,
  Mail,
  UserCheck,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon ? iconMap[category.icon] || Package : Package;

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="glass-card p-6 hover-lift group block"
    >
      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
      
      {category.description && (
        <p className="text-muted-foreground text-sm">
          {category.description}
        </p>
      )}
    </Link>
  );
}

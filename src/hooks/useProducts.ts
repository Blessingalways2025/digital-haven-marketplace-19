import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  featured: boolean;
  category_id: string | null;
  domains: string[] | null;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
}

export function useProducts(categorySlug?: string) {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, icon)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();

        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, icon)
        `)
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Product[];
    },
  });
}

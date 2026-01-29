import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  layout: 'grid' | 'list';
}

interface ContentSettings {
  welcomeTitle: string;
  welcomeSubtitle: string;
  footerText: string;
}

export function useStoreSettings() {
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ['store-settings', 'theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'theme')
        .maybeSingle();
      
      if (error) throw error;
      return (data?.value as unknown as ThemeSettings) ?? {
        primaryColor: '190 100% 50%',
        accentColor: '160 100% 45%',
        layout: 'grid',
      };
    },
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['store-settings', 'content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'content')
        .maybeSingle();
      
      if (error) throw error;
      return (data?.value as unknown as ContentSettings) ?? {
        welcomeTitle: 'Digital Marketplace',
        welcomeSubtitle: 'Premium digital products at your fingertips',
        footerText: 'Secure. Fast. Reliable.',
      };
    },
  });

  return {
    theme,
    content,
    isLoading: themeLoading || contentLoading,
  };
}

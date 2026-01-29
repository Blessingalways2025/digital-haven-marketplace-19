import { useState } from 'react';
import { Palette, LayoutGrid, LayoutList } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export default function AdminTheme() {
  const { theme, isLoading } = useStoreSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [primaryColor, setPrimaryColor] = useState(theme?.primaryColor || '190 100% 50%');
  const [accentColor, setAccentColor] = useState(theme?.accentColor || '160 100% 45%');
  const [layout, setLayout] = useState(theme?.layout || 'grid');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('store_settings')
        .update({
          value: { primaryColor, accentColor, layout },
        })
        .eq('key', 'theme');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings', 'theme'] });
      toast({ title: 'Theme settings saved' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Theme Settings</h1>

      <div className="max-w-2xl space-y-8">
        {/* Color Settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Colors</h2>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color (HSL)</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="190 100% 50%"
                />
                <div
                  className="h-10 w-20 rounded-lg border"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Format: hue saturation% lightness% (e.g., 190 100% 50%)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color (HSL)</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="accentColor"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="160 100% 45%"
                />
                <div
                  className="h-10 w-20 rounded-lg border"
                  style={{ backgroundColor: `hsl(${accentColor})` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6">Product Layout</h2>

          <RadioGroup
            value={layout}
            onValueChange={setLayout}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="grid" id="grid" />
              <Label htmlFor="grid" className="flex items-center gap-2 cursor-pointer">
                <LayoutGrid className="h-4 w-4" />
                Grid
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="list" id="list" />
              <Label htmlFor="list" className="flex items-center gap-2 cursor-pointer">
                <LayoutList className="h-4 w-4" />
                List
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="glow-primary"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Theme Settings'}
        </Button>
      </div>
    </div>
  );
}

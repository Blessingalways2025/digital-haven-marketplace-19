import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export default function AdminContent() {
  const { content, isLoading } = useStoreSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('');
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    if (content) {
      setWelcomeTitle(content.welcomeTitle || '');
      setWelcomeSubtitle(content.welcomeSubtitle || '');
      setFooterText(content.footerText || '');
    }
  }, [content]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('store_settings')
        .update({
          value: { welcomeTitle, welcomeSubtitle, footerText },
        })
        .eq('key', 'content');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings', 'content'] });
      toast({ title: 'Content settings saved' });
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
      <h1 className="text-3xl font-bold mb-8">Store Content</h1>

      <div className="max-w-2xl">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Homepage Content</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="welcomeTitle">Welcome Title</Label>
              <Input
                id="welcomeTitle"
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                placeholder="Digital Marketplace"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeSubtitle">Welcome Subtitle</Label>
              <Textarea
                id="welcomeSubtitle"
                value={welcomeSubtitle}
                onChange={(e) => setWelcomeSubtitle(e.target.value)}
                placeholder="Premium digital products at your fingertips"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="Secure. Fast. Reliable."
              />
            </div>
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="mt-6 glow-primary"
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Content'}
        </Button>
      </div>
    </div>
  );
}

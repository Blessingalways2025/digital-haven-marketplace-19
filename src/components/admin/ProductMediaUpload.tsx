import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductMediaUploadProps {
  type: 'image' | 'video';
  currentUrl: string | null;
  onUpload: (url: string | null) => void;
  productId?: string;
}

export function ProductMediaUpload({ type, currentUrl, onUpload, productId }: ProductMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const isImage = type === 'image';
  const accept = isImage ? 'image/*' : 'video/*';
  const Icon = isImage ? ImageIcon : Video;
  const label = isImage ? 'Product Image' : 'Product Video';

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB for video, 5MB for image)
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: `Maximum size is ${isImage ? '5MB' : '50MB'}`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId || 'new'}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-media')
        .getPublicUrl(filePath);

      onUpload(urlData.publicUrl);
      toast({ title: `${label} uploaded successfully` });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onUpload(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          {isImage ? (
            <img 
              src={currentUrl} 
              alt="Product preview" 
              className="w-full h-32 object-cover"
            />
          ) : (
            <video 
              src={currentUrl} 
              className="w-full h-32 object-cover"
              controls
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {uploading ? (
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <>
                <Icon className="h-8 w-8" />
                <span className="text-sm">Click to upload {type}</span>
              </>
            )}
          </div>
          <Input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

-- Add product media columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_preview boolean DEFAULT true;

-- Create storage bucket for product media
INSERT INTO storage.buckets (id, name, public) VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product media
CREATE POLICY "Anyone can view product media" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

CREATE POLICY "Admins can upload product media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product media" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'));
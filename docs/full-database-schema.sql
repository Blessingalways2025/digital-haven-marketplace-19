-- ============================================================
-- COMPLETE DATABASE SCHEMA FOR DIGITAL MARKETPLACE
-- Run this SQL in a fresh Supabase project to set up everything
-- ============================================================

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- Profiles table (user metadata)
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table (admin/user separation)
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  file_content text,
  domains text[],
  is_active boolean DEFAULT true,
  featured boolean DEFAULT false,
  image_url text,
  video_url text,
  show_preview boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  total numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_address text,
  transaction_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  delivered_content text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Store settings table (for dynamic theme/content)
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Crypto wallets table
CREATE TABLE public.crypto_wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency text NOT NULL,
  address text NOT NULL,
  network text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Function to check user roles (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to deliver order content automatically
CREATE OR REPLACE FUNCTION public.deliver_order_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.order_items
    SET delivered_content = p.file_content
    FROM public.products p
    WHERE order_items.order_id = NEW.id
      AND order_items.product_id = p.id
      AND order_items.delivered_content IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. TRIGGERS
-- ============================================================

-- Trigger for new user signup (create profile and assign role)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for automatic content delivery
CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.deliver_order_content();

-- ============================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own pending orders" ON public.orders
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Store settings policies
CREATE POLICY "Anyone can view store settings" ON public.store_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage store settings" ON public.store_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Crypto wallets policies
CREATE POLICY "Anyone can view active wallets" ON public.crypto_wallets
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage wallets" ON public.crypto_wallets
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- 8. STORAGE BUCKET FOR PRODUCT MEDIA
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('product-media', 'product-media', true);

-- Storage policies for product media
CREATE POLICY "Anyone can view product media" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');
CREATE POLICY "Admins can upload product media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product media" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'));

-- ============================================================
-- 9. INITIAL DATA
-- ============================================================

-- Default categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('SMTP Hosts', 'hosts', 'Premium SMTP servers and hosting solutions', 'Server', 1),
  ('Leads', 'leads', 'High-quality B2B and B2C lead databases', 'Users', 2),
  ('Webmails', 'webmails', 'Corporate webmail access and accounts', 'Mail', 3),
  ('Accounts', 'accounts', 'Verified platform accounts', 'UserCheck', 4);

-- Default crypto wallets (replace with your actual addresses)
INSERT INTO public.crypto_wallets (currency, address, network) VALUES
  ('BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Bitcoin'),
  ('ETH', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'Ethereum'),
  ('USDT', 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', 'Tron (TRC20)'),
  ('LTC', 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Litecoin');

-- Default theme settings
INSERT INTO public.store_settings (key, value) VALUES
  ('theme', '{"primary": "142 70% 45%", "accent": "280 100% 70%", "background": "222 47% 6%"}'),
  ('content', '{"siteName": "Digital Marketplace", "tagline": "Premium Digital Products", "heroTitle": "Premium Digital Products", "heroSubtitle": "Your trusted source for high-quality digital goods. Instant delivery, secure transactions."}');

-- ============================================================
-- 10. TO MAKE A USER ADMIN
-- ============================================================
-- Run this query replacing 'USER_ID_HERE' with the actual user UUID:
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'USER_ID_HERE';
-- 
-- Or insert directly:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('USER_ID_HERE', 'admin');

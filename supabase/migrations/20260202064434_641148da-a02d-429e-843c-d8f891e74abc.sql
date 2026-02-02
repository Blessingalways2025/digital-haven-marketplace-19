-- Fix 1: Add RLS policy for users to update their own pending orders
-- This allows users to add transaction_hash after payment
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Fix 2: Create automated digital product delivery trigger
-- When order status changes to 'completed', copy file_content to delivered_content
CREATE OR REPLACE FUNCTION public.deliver_order_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When order status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Copy file_content from products to delivered_content in order_items
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

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.deliver_order_content();
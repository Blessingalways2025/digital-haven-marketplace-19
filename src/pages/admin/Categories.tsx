import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

const iconOptions = ['Server', 'Users', 'Mail', 'UserCheck'];

export default function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (category: {
      name: string;
      slug: string;
      description: string | null;
      icon: string | null;
      sort_order: number;
      is_active: boolean;
    }) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(category)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([category]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      setEditingCategory(null);
      toast({ title: editingCategory ? 'Category updated' : 'Category created' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const category = {
      name: formData.get('name') as string,
      slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string || null,
      icon: formData.get('icon') as string || null,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
      is_active: formData.get('is_active') === 'on',
    };

    saveMutation.mutate(category);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="glow-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingCategory?.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCategory?.description || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    name="icon"
                    defaultValue={editingCategory?.icon || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    min="0"
                    defaultValue={editingCategory?.sort_order || 0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingCategory?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="glass-card p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{category.name}</h3>
                  {!category.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.description || 'No description'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => deleteMutation.mutate(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          No categories yet. Click "Add Category" to create one.
        </div>
      )}
    </div>
  );
}
